import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URL_PREFEITURA = "https://www.pedreiras.ma.gov.br/obras.php";
const IMAGEM_PADRAO = "/obra-principal.png";

type ObraNormalizada = {
  fonte_id: string;
  titulo: string;
  local: string;
  investimento: string;
  inicio: string;
  prazo: string;
  progresso: number;
  status: string;
  tipo: string;
  imagem: string;
  descricao: string;
  detalhes: string;
  orgao: string;
  empresa: string;
  ultima_atualizacao: string;
  origem: "Oficial";
};

function limparTexto(texto: string) {
  return texto
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#039;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizarTexto(texto?: string | null) {
  return (texto || "")
    .replace(/\s+/g, " ")
    .replace(/\uFFFD/g, "")
    .trim();
}

function montarUrlAbsoluta(url: string) {
  if (url.startsWith("http")) return url;
  return new URL(url, URL_PREFEITURA).toString();
}

function pegarPrimeiroMatch(texto: string, regex: RegExp) {
  const match = texto.match(regex);
  return normalizarTexto(match?.[1]) || "Não informado";
}

function pegarValorTotal(texto: string) {
  const valor = pegarPrimeiroMatch(
    texto,
    /VALOR TOTAL DA OBRA\s*R\$\s*([\d.,]+)/i,
  );

  return valor !== "Não informado" ? `R$ ${valor}` : "Não informado";
}

function pegarTotalMedicoes(texto: string) {
  const valor = pegarPrimeiroMatch(
    texto,
    /TOTAL DE MEDIÇÕES\s*R\$\s*([\d.,]+)/i,
  );

  return valor !== "Não informado" ? `R$ ${valor}` : "Não informado";
}

function pegarPercentualObra(texto: string) {
  const percentual = pegarPrimeiroMatch(
    texto,
    /PERCENTUAL DA OBRA\s*([\d.,]+)%/i,
  );

  if (percentual === "Não informado") return 0;

  const numero = Number(percentual.replace(".", "").replace(",", "."));

  if (Number.isNaN(numero)) return 0;

  return Math.max(0, Math.min(100, Math.round(numero)));
}

function pegarInicio(texto: string) {
  return pegarPrimeiroMatch(texto, /Data início:\s*(\d{2}\/\d{2}\/\d{4})/i);
}

function pegarPrazo(texto: string) {
  return pegarPrimeiroMatch(texto, /Data fim:\s*(\d{2}\/\d{2}\/\d{4})/i);
}

function pegarSecretaria(texto: string) {
  return pegarPrimeiroMatch(
    texto,
    /secretaria:\s*([A-ZÀ-Úa-zà-ú0-9\s./-]+?)\s+tipo:/i,
  );
}

function pegarTipoSite(texto: string) {
  return pegarPrimeiroMatch(
    texto,
    /tipo:\s*([A-ZÀ-Úa-zà-ú0-9\s./-]+?)\s+Fonte:/i,
  );
}

function pegarLocal(texto: string) {
  const local = pegarPrimeiroMatch(texto, /Local:\s*(.+?Pedreiras\s*-\s*MA)/i);

  return local !== "Não informado" ? local : "Pedreiras - MA";
}

function pegarEmpresa(texto: string) {
  const empresaContrato = pegarPrimeiroMatch(
    texto,
    /CONTRATO ORIGINAL\s+\d+\s+\d{4}\s+(.+?)\s+[\d.]+,\d{2}/i,
  );

  if (empresaContrato !== "Não informado") {
    return empresaContrato;
  }

  return pegarPrimeiroMatch(
    texto,
    /Pela execução:\s*(.+?)\s+Pela fiscalização:/i,
  );
}

function pegarUltimaAtualizacao(texto: string) {
  return pegarPrimeiroMatch(
    texto,
    /DATA:\s*(\d{2}\/\d{2}\/\d{4})\s+-\s+SITUAÇÃO:/i,
  );
}

function pegarSituacaoAtual(texto: string) {
  return pegarPrimeiroMatch(
    texto,
    /DATA:\s*\d{2}\/\d{2}\/\d{4}\s+-\s+SITUAÇÃO:\s*(.+?)\s+STATUS:/i,
  );
}

function definirStatus(texto: string, progresso: number) {
  if (progresso >= 100) return "Concluída";

  const status = pegarPrimeiroMatch(
    texto,
    /STATUS:\s*([A-ZÀ-Ú\s]+?)(?:\s+DATA:|\s+Voltar|\s*$)/i,
  );

  const statusNormalizado = status.toLowerCase();

  if (statusNormalizado.includes("cancel")) return "Cancelada";
  if (statusNormalizado.includes("conclu")) return "Concluída";
  if (statusNormalizado.includes("andamento")) return "Em andamento";

  return "Em andamento";
}

function classificarTipo(tipoSite: string, titulo: string) {
  const texto = `${tipoSite} ${titulo}`.toLowerCase();

  if (
    texto.includes("educação") ||
    texto.includes("ensino") ||
    texto.includes("escola") ||
    texto.includes("infância") ||
    texto.includes("secretaria municipal de educação")
  ) {
    return "Educação";
  }

  if (
    texto.includes("saúde") ||
    texto.includes("samu") ||
    texto.includes("ubs") ||
    texto.includes("unidade básica")
  ) {
    return "Saúde";
  }

  if (
    texto.includes("drenagem") ||
    texto.includes("pavimentação") ||
    texto.includes("ponte") ||
    texto.includes("estrada")
  ) {
    return "Infraestrutura";
  }

  if (
    texto.includes("praça") ||
    texto.includes("ginásio") ||
    texto.includes("mercado")
  ) {
    return "Espaço público";
  }

  if (
    texto.includes("palácio") ||
    texto.includes("restauração") ||
    texto.includes("patrimônio")
  ) {
    return "Patrimônio público";
  }

  if (tipoSite !== "Não informado") {
    return tipoSite;
  }

  return "Obra pública";
}

function criarFonteIdPrefeitura(id: string) {
  return `prefeitura-pedreiras-${id}`;
}

function extrairLinksDeObras(html: string) {
  const links: Array<{ id: string; url: string; titulo: string }> = [];
  const regex =
    /<a[^>]+href=["']([^"']*obras\.php\?id=(\d+)[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;

  while ((match = regex.exec(html)) !== null) {
    const url = montarUrlAbsoluta(match[1]);
    const id = match[2];
    const titulo = normalizarTexto(limparTexto(match[3]));

    if (!id || !titulo || titulo.toLowerCase() === "acessar") {
      continue;
    }

    links.push({ id, url, titulo });
  }

  const mapa = new Map<string, { id: string; url: string; titulo: string }>();

  for (const link of links) {
    mapa.set(link.id, link);
  }

  return Array.from(mapa.values());
}

async function buscarObrasPrefeitura() {
  const resposta = await fetch(URL_PREFEITURA, {
    cache: "no-store",
    headers: {
      "User-Agent": "CidadeEmProgresso/1.0",
    },
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao acessar Prefeitura: ${resposta.status}`);
  }

  const html = await resposta.text();
  const links = extrairLinksDeObras(html);

  const obras: ObraNormalizada[] = [];

  for (const link of links.slice(0, 40)) {
    try {
      const respostaDetalhe = await fetch(link.url, {
        cache: "no-store",
        headers: {
          "User-Agent": "CidadeEmProgresso/1.0",
        },
      });

      if (!respostaDetalhe.ok) {
        continue;
      }

      const htmlDetalhe = await respostaDetalhe.text();
      const textoDetalhe = limparTexto(htmlDetalhe);

      const investimento = pegarValorTotal(textoDetalhe);
      const totalMedicoes = pegarTotalMedicoes(textoDetalhe);
      const progresso = pegarPercentualObra(textoDetalhe);
      const inicio = pegarInicio(textoDetalhe);
      const prazo = pegarPrazo(textoDetalhe);
      const orgao = pegarSecretaria(textoDetalhe);
      const tipoSite = pegarTipoSite(textoDetalhe);
      const local = pegarLocal(textoDetalhe);
      const empresa = pegarEmpresa(textoDetalhe);
      const ultimaAtualizacao = pegarUltimaAtualizacao(textoDetalhe);
      const situacaoAtual = pegarSituacaoAtual(textoDetalhe);
      const status = definirStatus(textoDetalhe, progresso);
      const tipo = classificarTipo(tipoSite, link.titulo);

      obras.push({
        fonte_id: criarFonteIdPrefeitura(link.id),
        titulo: link.titulo,
        local,
        investimento,
        inicio,
        prazo,
        progresso,
        status,
        tipo,
        imagem: IMAGEM_PADRAO,
        descricao:
          situacaoAtual !== "Não informado" ? situacaoAtual : link.titulo,
        detalhes: `Fonte oficial: Prefeitura de Pedreiras-MA. Total medido: ${totalMedicoes}. Link: ${link.url}`,
        orgao,
        empresa,
        ultima_atualizacao: ultimaAtualizacao,
        origem: "Oficial",
      });
    } catch (error) {
      console.error("Erro ao ler detalhe da obra:", link.url, error);
    }
  }

  return obras;
}

function normalizarObraGov(
  item: Record<string, unknown>,
): ObraNormalizada | null {
  const id =
    item.idProjetoInvestimento ||
    item.idProjeto ||
    item.id ||
    item.codigo ||
    item.identificadorUnico;

  const titulo =
    item.nome ||
    item.titulo ||
    item.nomeProjeto ||
    item.descricao ||
    item.objeto;

  if (!id || !titulo) {
    return null;
  }

  const progressoBruto =
    item.percentualExecucaoFisica ||
    item.percentualExecucao ||
    item.percentualConcluido ||
    item.percentual ||
    0;

  const progresso = Number(String(progressoBruto).replace(",", "."));

  const valor =
    item.valorGlobal ||
    item.valorTotal ||
    item.valorInvestimento ||
    item.valorPrevisto ||
    "Não informado";

  const situacao =
    item.situacao || item.status || item.situacaoProjeto || "Não informado";

  const tituloTexto = String(titulo);
  const situacaoTexto = String(situacao);

  return {
    fonte_id: `obrasgov-${String(id)}`,
    titulo: tituloTexto,
    local: "Pedreiras - MA",
    investimento: String(valor),
    inicio: String(
      item.dataInicio || item.dataInicioPrevista || "Não informado",
    ),
    prazo: String(
      item.dataFim || item.dataConclusaoPrevista || "Não informado",
    ),
    progresso: Number.isNaN(progresso) ? 0 : Math.round(progresso),
    status: definirStatus(
      situacaoTexto,
      Number.isNaN(progresso) ? 0 : progresso,
    ),
    tipo: classificarTipo(String(item.tipo || "Não informado"), tituloTexto),
    imagem: IMAGEM_PADRAO,
    descricao: situacaoTexto,
    detalhes: "Obra importada da API de Dados Abertos do ObrasGov.br.",
    orgao: String(
      item.orgao || item.orgaoExecutor || item.tomador || "Não informado",
    ),
    empresa: String(item.empresa || item.contratada || "Não informado"),
    ultima_atualizacao: String(
      item.dataAtualizacao || item.updatedAt || "Não informado",
    ),
    origem: "Oficial",
  };
}

async function tentarBuscarObrasGov() {
  const urlsPossiveis = [
    "https://api.obrasgov.gestao.gov.br/obrasgov/api/v3/api-docs",
    "https://api.obrasgov.gestao.gov.br/obrasgov/api/api-docs",
    "https://api.obrasgov.gestao.gov.br/obrasgov/api/projetos-investimento?uf=MA&municipio=Pedreiras",
    "https://api.obrasgov.gestao.gov.br/obrasgov/api/projetos?uf=MA&municipio=Pedreiras",
    "https://api.obrasgov.gestao.gov.br/obrasgov/api/obras?uf=MA&municipio=Pedreiras",
  ];

  const obras: ObraNormalizada[] = [];

  for (const url of urlsPossiveis) {
    try {
      const resposta = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "User-Agent": "CidadeEmProgresso/1.0",
        },
      });

      if (!resposta.ok) {
        continue;
      }

      const json = await resposta.json();

      const lista = Array.isArray(json)
        ? json
        : Array.isArray(json.content)
          ? json.content
          : Array.isArray(json.data)
            ? json.data
            : Array.isArray(json.items)
              ? json.items
              : [];

      for (const item of lista) {
        const obra = normalizarObraGov(item);

        if (obra) {
          obras.push(obra);
        }
      }
    } catch (error) {
      console.error("Erro ao tentar ObrasGov:", url, error);
    }
  }

  return obras;
}

function removerDuplicadas(obras: ObraNormalizada[]) {
  const mapa = new Map<string, ObraNormalizada>();

  for (const obra of obras) {
    mapa.set(obra.fonte_id, obra);
  }

  return Array.from(mapa.values());
}

export async function POST(request: NextRequest) {
  try {
    const chaveImportacao = request.headers.get("x-import-secret");

    if (
      process.env.IMPORT_SECRET &&
      chaveImportacao !== process.env.IMPORT_SECRET
    ) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }

    const obrasPrefeitura = await buscarObrasPrefeitura();
    const obrasGov = await tentarBuscarObrasGov();

    const obrasParaSalvar = removerDuplicadas([
      ...obrasPrefeitura,
      ...obrasGov,
    ]);

    if (obrasParaSalvar.length === 0) {
      return NextResponse.json(
        {
          erro: "Nenhuma obra encontrada nas fontes públicas.",
          prefeitura: obrasPrefeitura.length,
          obrasgov: obrasGov.length,
        },
        { status: 404 },
      );
    }

    const { data, error } = await supabaseAdmin
      .from("obras")
      .upsert(obrasParaSalvar, {
        onConflict: "fonte_id",
      })
      .select("id, fonte_id, titulo, origem, progresso, status");

    if (error) {
      return NextResponse.json(
        {
          etapa: "salvar obras no Supabase",
          erro: error.message,
          codigo: error.code,
          detalhes: error.details,
          hint: error.hint,
          exemplo: obrasParaSalvar[0],
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      mensagem: "Obras oficiais importadas/atualizadas com sucesso.",
      fontes: {
        prefeitura: obrasPrefeitura.length,
        obrasgov: obrasGov.length,
      },
      salvas: data?.length || 0,
      exemplo: obrasParaSalvar[0],
      obras: data || [],
    });
  } catch (error) {
    console.error("Erro inesperado na importação:", error);

    return NextResponse.json(
      {
        etapa: "erro inesperado",
        erro:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao importar obras oficiais.",
      },
      { status: 500 },
    );
  }
}
