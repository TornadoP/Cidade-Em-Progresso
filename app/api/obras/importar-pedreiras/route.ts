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
  const percentualObra = pegarPrimeiroMatch(
    texto,
    /PERCENTUAL DA OBRA\s*([\d.,]+)%/i,
  );

  if (percentualObra !== "Não informado") {
    const numero = Number(percentualObra.replace(".", "").replace(",", "."));

    if (!Number.isNaN(numero)) {
      return Math.max(0, Math.min(100, Math.round(numero)));
    }
  }

  const percentualMedicao = pegarPrimeiroMatch(
    texto,
    /TOTAL DE MEDIÇÕES\s*R\$\s*[\d.,]+[\s\S]{0,120}?PERCENTUAL DA OBRA\s*([\d.,]+)%/i,
  );

  if (percentualMedicao !== "Não informado") {
    const numero = Number(percentualMedicao.replace(".", "").replace(",", "."));

    if (!Number.isNaN(numero)) {
      return Math.max(0, Math.min(100, Math.round(numero)));
    }
  }

  return 0;
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
  const match = texto.match(
    /Local:\s*(.+?Pedreiras\s*-\s*MA)(?:\s+Mais informações|\s+Data prevista|\s+Valor total|\s+-->|\s*$)/i,
  );

  const local = normalizarTexto(match?.[1]);

  if (!local || local.length > 180) {
    return "Pedreiras - MA";
  }

  return local;
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

function limparTituloParaCard(titulo: string, tipo: string) {
  const original = normalizarTexto(titulo);
  const texto = original.toUpperCase();

  if (
    texto.includes("MANUTENÇÃO PREDIAL") ||
    texto.includes("MANUTENÇÃO PREVENTIVA") ||
    texto.includes("MANUTENÇÃO CORRETIVA")
  ) {
    if (texto.includes("EDUCAÇÃO") || tipo === "Educação") {
      return "Manutenção predial em unidades da Educação";
    }

    if (texto.includes("SAÚDE") || tipo === "Saúde") {
      return "Manutenção predial em unidades da Saúde";
    }

    return "Manutenção predial em prédios públicos";
  }

  if (
    texto.includes("UNIDADE BASICA DE SAUDE") ||
    texto.includes("UNIDADE BÁSICA DE SAÚDE") ||
    texto.includes("UBS")
  ) {
    return "Construção de Unidade Básica de Saúde";
  }

  if (texto.includes("SAMU")) {
    return "Reforma e adequação da base do SAMU";
  }

  if (texto.includes("DRENAGEM")) {
    return "Implantação de sistema de drenagem";
  }

  if (
    texto.includes("PAVIMENTAÇÃO ASFÁLTICA") ||
    texto.includes("PAVIMENTACAO ASFALTICA") ||
    texto.includes("SINALIZAÇÃO HORIZONTAL") ||
    texto.includes("SINALIZACAO HORIZONTAL")
  ) {
    return "Pavimentação asfáltica e sinalização";
  }

  if (
    texto.includes("RECUPERAÇÃO DE ESTRADAS") ||
    texto.includes("RECUPERACAO DE ESTRADAS") ||
    texto.includes("ESTRADA VICINAL") ||
    texto.includes("ESTRADAS VICINAIS")
  ) {
    return "Recuperação de estradas municipais";
  }

  if (
    texto.includes("PONTE MISTA") ||
    texto.includes("PONTE EM SEÇÃO MISTA") ||
    texto.includes("PONTE EM ESTRUTURA METÁLICA") ||
    texto.includes("PONTE EM ESTRUTURA METALICA")
  ) {
    return "Construção de ponte";
  }

  if (
    texto.includes("SECRETARIA MUNICIPAL DE EDUCAÇÃO") ||
    texto.includes("SEDE DA SECRETARIA MUNICIPAL DE EDUCAÇÃO")
  ) {
    return "Construção da sede da Secretaria Municipal de Educação";
  }

  if (
    texto.includes("SECRETARIA DE MEIO AMBIENTE") ||
    texto.includes("SECRETARIA MUNICIPAL DE MEIO AMBIENTE")
  ) {
    return "Construção da Secretaria de Meio Ambiente";
  }

  if (
    texto.includes("MERCADOS MUNICIPAIS") ||
    texto.includes("MERCADO MUNICIPAL")
  ) {
    return "Reforma de mercados municipais";
  }

  if (
    texto.includes("GINÁSIO") ||
    texto.includes("GINASIO") ||
    texto.includes("POLIESPORTIVO")
  ) {
    return "Reforma de ginásio poliesportivo";
  }

  if (
    texto.includes("PALÁCIO MUNICIPAL") ||
    texto.includes("PALACIO MUNICIPAL")
  ) {
    return "Restauração do Palácio Municipal";
  }

  if (
    texto.includes("JARDIM DE INFÂNCIA FÁTIMA ROMA") ||
    texto.includes("JARDIM DE INFANCIA FATIMA ROMA")
  ) {
    return "Reforma do Jardim de Infância Fátima Roma";
  }

  const semContrato = original
    .replace(/,\s*CONFORME.*$/i, "")
    .replace(/,\s*CONTRATO.*$/i, "")
    .replace(/,\s*PROCESSO ADMINISTRATIVO.*$/i, "")
    .replace(/\s*CONFORME PROCESSO.*$/i, "")
    .replace(/\s*CONTRATO ADMINISTRATIVO.*$/i, "")
    .replace(/\s*N[º°]\s*\d+.*$/i, "")
    .trim();

  if (semContrato.length > 85) {
    return `${semContrato.slice(0, 82).trim()}...`;
  }

  return semContrato || original;
}

function definirStatusDaObra(progresso: number) {
  if (progresso >= 100) return "Concluída";
  if (progresso <= 0) return "Em planejamento";
  return "Em andamento";
}

function montarDescricaoParaCard(params: {
  titulo: string;
  tipo: string;
  local: string;
  investimento: string;
  progresso: number;
  orgao: string;
}) {
  const { tipo, local, investimento, progresso, orgao } = params;

  const partes: string[] = [];

  partes.push(`Obra oficial cadastrada pela Prefeitura de Pedreiras-MA.`);

  if (tipo !== "Não informado") {
    partes.push(`Categoria: ${tipo}.`);
  }

  if (orgao !== "Não informado") {
    partes.push(`Órgão responsável: ${orgao}.`);
  }

  if (local !== "Pedreiras - MA" && local !== "Não informado") {
    partes.push(`Local: ${local}.`);
  }

  if (investimento !== "Não informado") {
    partes.push(`Investimento previsto: ${investimento}.`);
  }

  partes.push(`Progresso informado: ${progresso}%.`);

  const descricao = partes.join(" ");

  return limitarTexto(descricao, 280);
}

function limitarTexto(texto: string, limite = 220) {
  const limpo = normalizarTexto(texto);

  if (limpo.length <= limite) return limpo;

  return `${limpo.slice(0, limite).trim()}...`;
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
      const tipo = classificarTipo(tipoSite, link.titulo);
      const tituloLimpo = limparTituloParaCard(link.titulo, tipo);
      const status = definirStatusDaObra(progresso);

      obras.push({
        fonte_id: criarFonteIdPrefeitura(link.id),
        titulo: tituloLimpo,
        local,
        investimento,
        inicio,
        prazo,
        progresso,
        status,
        tipo,
        imagem: IMAGEM_PADRAO,
        descricao: montarDescricaoParaCard({
          titulo: tituloLimpo,
          tipo,
          local,
          investimento,
          progresso,
          orgao,
        }),
        detalhes: limitarTexto(
          `Fonte oficial: Prefeitura de Pedreiras-MA. Total medido: ${totalMedicoes}. Link: ${link.url}`,
          260,
        ),
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

  const tituloTexto = String(titulo);

  const progressoFinal = Number.isNaN(progresso)
    ? 0
    : Math.max(0, Math.min(100, Math.round(progresso)));

  const tipoFinal = classificarTipo(
    String(item.tipo || item.categoria || "Não informado"),
    tituloTexto,
  );

  const investimentoFinal =
    valor !== "Não informado" ? String(valor) : "Não informado";

  const tituloFinal = limparTituloParaCard(tituloTexto, tipoFinal);

  return {
    fonte_id: `obrasgov-${String(id)}`,
    titulo: tituloFinal,
    local: "Pedreiras - MA",
    investimento: investimentoFinal,
    inicio: String(
      item.dataInicio || item.dataInicioPrevista || "Não informado",
    ),
    prazo: String(
      item.dataFim || item.dataConclusaoPrevista || "Não informado",
    ),
    progresso: progressoFinal,
    status: definirStatusDaObra(progressoFinal),
    tipo: tipoFinal,
    imagem: IMAGEM_PADRAO,
    descricao: montarDescricaoParaCard({
      titulo: tituloFinal,
      tipo: tipoFinal,
      local: "Pedreiras - MA",
      investimento: investimentoFinal,
      progresso: progressoFinal,
      orgao: String(
        item.orgao || item.orgaoExecutor || item.tomador || "Não informado",
      ),
    }),
    detalhes: limitarTexto(
      "Fonte oficial: API de Dados Abertos do ObrasGov.br.",
      260,
    ),
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
