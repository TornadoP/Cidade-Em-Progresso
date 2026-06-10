import { NextRequest, NextResponse } from "next/server";
import { createCanvas } from "@napi-rs/canvas";
import { createWorker } from "tesseract.js";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.js";
import type {
  DocumentInitParameters,
  PDFDocumentProxy,
} from "pdfjs-dist/types/src/display/api";
import { exigirAdmin } from "@/app/lib/apiAuth";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

pdfjsLib.GlobalWorkerOptions.workerSrc = "";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type DocumentoObra = {
  id: string;
  obra_id: string;
  titulo: string;
  url: string;
  tipo: string | null;
};

type ParametrosPdfNode = DocumentInitParameters & {
  disableWorker: boolean;
  isEvalSupported: boolean;
};

function normalizarTexto(texto?: string | null) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function limitarTexto(texto: string, limite = 8000) {
  if (texto.length <= limite) return texto;
  return `${texto.slice(0, limite).trim()}...`;
}

function classificarDocumentoPorOcr(textoOriginal: string, index: number) {
  const texto = normalizarTexto(textoOriginal);

  const possuiRelatorioFotografico =
    texto.includes("relatorio fotografico") ||
    texto.includes("relatorio fotografico da obra") ||
    texto.includes("registro fotografico") ||
    texto.includes("relatorio de fotos") ||
    texto.includes("fotos da obra");

  if (possuiRelatorioFotografico) {
    return {
      titulo: "Relatório Fotográfico",
      tipo: "relatorio_fotografico",
      possui_relatorio_fotografico: true,
    };
  }

  if (texto.includes("nota de empenho") || texto.includes("empenho")) {
    return {
      titulo: "Nota de Empenho",
      tipo: "nota_empenho",
      possui_relatorio_fotografico: false,
    };
  }

  if (
    texto.includes("processo de despesa") ||
    texto.includes("despesa orcamentaria") ||
    texto.includes("processo administrativo")
  ) {
    return {
      titulo: "Processo de Despesa Orçamentária",
      tipo: "processo_despesa",
      possui_relatorio_fotografico: false,
    };
  }

  if (
    texto.includes("boletim de medicao") ||
    texto.includes("medicao") ||
    texto.includes("medicoes")
  ) {
    return {
      titulo: `${index + 1}ª Medição`,
      tipo: "medicao",
      possui_relatorio_fotografico: false,
    };
  }

  if (
    texto.includes("nota fiscal") ||
    texto.includes("nf-e") ||
    texto.includes("nfe")
  ) {
    return {
      titulo: "Nota Fiscal",
      tipo: "nota_fiscal",
      possui_relatorio_fotografico: false,
    };
  }

  if (texto.includes("liquidacao")) {
    return {
      titulo: "Liquidação",
      tipo: "liquidacao",
      possui_relatorio_fotografico: false,
    };
  }

  if (
    texto.includes("anotacao de responsabilidade tecnica") ||
    texto.includes("responsabilidade tecnica") ||
    texto.includes(" art ")
  ) {
    return {
      titulo: "ART da obra",
      tipo: "art",
      possui_relatorio_fotografico: false,
    };
  }

  return {
    titulo: `Documento da obra ${index + 1}`,
    tipo: "documento",
    possui_relatorio_fotografico: false,
  };
}

async function baixarPdf(url: string) {
  const resposta = await fetch(url, {
    cache: "no-store",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
      Accept: "application/pdf,*/*",
    },
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao baixar PDF: ${resposta.status}`);
  }

  const arrayBuffer = await resposta.arrayBuffer();

  return new Uint8Array(arrayBuffer);
}

function criarParametrosPdf(pdfData: Uint8Array) {
  return {
    data: pdfData.slice(),
    disableWorker: true,
    useWorkerFetch: false,
    isEvalSupported: false,
  } satisfies ParametrosPdfNode;
}

async function renderizarPaginaComoImagem(
  pdf: PDFDocumentProxy,
  numeroPagina: number,
) {
  if (numeroPagina > pdf.numPages) {
    return null;
  }

  const page = await pdf.getPage(numeroPagina);
  const viewport = page.getViewport({ scale: 1.0 });

  const canvas = createCanvas(
    Math.floor(viewport.width),
    Math.floor(viewport.height),
  );

  const context = canvas.getContext("2d");

  await page.render({
    canvasContext: context as unknown as CanvasRenderingContext2D,
    viewport,
  }).promise;

  return canvas.toBuffer("image/png");
}

async function fazerOcrNasPrimeirasPaginas(url: string, paginasMaximas = 4) {
  const pdfData = await baixarPdf(url);

  const pdf = await pdfjsLib.getDocument(criarParametrosPdf(pdfData)).promise;

  const totalPaginasParaLer = Math.min(pdf.numPages, paginasMaximas);

  const worker = await createWorker("por");

  let textoFinal = "";

  try {
    for (let pagina = 1; pagina <= totalPaginasParaLer; pagina++) {
      const imagem = await renderizarPaginaComoImagem(pdf, pagina);

      if (!imagem) continue;

      const resultado = await worker.recognize(imagem);

      textoFinal += `\n\n--- PÁGINA ${pagina} ---\n\n`;
      textoFinal += resultado.data.text || "";
    }
  } finally {
    await worker.terminate();
  }

  return limitarTexto(textoFinal, 8000);
}

export async function POST(request: NextRequest) {
  try {
    const auth = await exigirAdmin(request);

    if (auth.resposta) {
      return auth.resposta;
    }

    const body = await request.json().catch(() => null);
    const limite = Number(body?.limite || 1);

    const { data: documentos, error: erroDocumentos } = await supabaseAdmin
      .from("obras_documentos")
      .select("id, obra_id, titulo, url, tipo")
      .or(
        "status_processamento.is.null,status_processamento.eq.pendente,status_processamento.eq.erro",
      )
      .order("created_at", { ascending: true })
      .limit(Math.max(1, Math.min(limite, 5)));

    if (erroDocumentos) {
      return NextResponse.json(
        {
          erro: "Erro ao buscar documentos para processar.",
          detalhes: erroDocumentos.message,
        },
        { status: 500 },
      );
    }

    if (!documentos || documentos.length === 0) {
      return NextResponse.json({
        mensagem: "Nenhum documento pendente para processar.",
        processados: 0,
      });
    }

    const resultados = [];

    for (let index = 0; index < documentos.length; index++) {
      const documento = documentos[index] as DocumentoObra;

      try {
        await supabaseAdmin
          .from("obras_documentos")
          .update({
            status_processamento: "processando",
            erro_processamento: null,
            processado_em: new Date().toISOString(),
          })
          .eq("id", documento.id);

        const textoOcr = await fazerOcrNasPrimeirasPaginas(documento.url, 1);
        const classificacao = classificarDocumentoPorOcr(textoOcr, index);

        const { error: erroAtualizar } = await supabaseAdmin
          .from("obras_documentos")
          .update({
            titulo: classificacao.titulo,
            titulo_extraido: classificacao.titulo,
            tipo: classificacao.tipo,
            texto_ocr: textoOcr,
            possui_relatorio_fotografico:
              classificacao.possui_relatorio_fotografico,
            status_processamento: "processado",
            processado_em: new Date().toISOString(),
          })
          .eq("id", documento.id);

        if (erroAtualizar) {
          throw new Error(erroAtualizar.message);
        }

        resultados.push({
          id: documento.id,
          url: documento.url,
          titulo: classificacao.titulo,
          tipo: classificacao.tipo,
          possui_relatorio_fotografico:
            classificacao.possui_relatorio_fotografico,
        });
      } catch (error) {
        const mensagemErro =
          error instanceof Error ? error.message : "Erro desconhecido";

        await supabaseAdmin
          .from("obras_documentos")
          .update({
            status_processamento: "erro",
            erro_processamento: mensagemErro,
            processado_em: new Date().toISOString(),
          })
          .eq("id", documento.id);

        resultados.push({
          id: documento.id,
          url: documento.url,
          erro: mensagemErro,
        });
      }
    }

    return NextResponse.json({
      mensagem: "Processamento de documentos concluído.",
      processados: resultados.length,
      resultados,
    });
  } catch (error) {
    console.error("Erro ao processar documentos:", error);

    return NextResponse.json(
      {
        erro:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao processar documentos.",
      },
      { status: 500 },
    );
  }
}
