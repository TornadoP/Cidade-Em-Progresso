import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/app/lib/apiAuth";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const URL_PREFEITURA = "https://www.pedreiras.ma.gov.br/obras.php";
const IMAGEM_PADRAO = "/obra-principal.png";

function headersNavegador(referer = "https://www.pedreiras.ma.gov.br/") {
  return {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    Referer: referer,
  };
}

function escolherImagemPorTipo(tipo: string) {
  const categoria = tipo.toLowerCase();

  if (categoria.includes("educação") || categoria.includes("educacao")) {
    return "/obras/educacao.jpg";
  }

  if (categoria.includes("saúde") || categoria.includes("saude")) {
    return "/obras/saude.jpg";
  }

  if (categoria.includes("infraestrutura")) {
    return "/obras/infraestrutura.jpg";
  }

  if (categoria.includes("lazer")) {
    return "/obras/lazer.jpg";
  }

  if (categoria.includes("patrimônio") || categoria.includes("patrimonio")) {
    return "/obras/patrimonio.jpg";
  }

  return IMAGEM_PADRAO;
}

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
  imagens_prefeitura?: string[];
  documentos_prefeitura?: string[];
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

function extrairImagensDaPrefeitura(html: string) {
  const imagens: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;

  let match;

  while ((match = regex.exec(html)) !== null) {
    const src = match[1];

    if (!src) continue;

    const url = montarUrlAbsoluta(src);
    const urlLower = url.toLowerCase();

    const pareceImagemInutil =
      urlLower.includes("logo") ||
      urlLower.includes("brasao") ||
      urlLower.includes("favicon") ||
      urlLower.includes("icon") ||
      urlLower.includes("loading") ||
      urlLower.includes("blank") ||
      urlLower.includes("placeholder") ||
      urlLower.includes("no-image") ||
      urlLower.includes("sem-foto");

    const pareceArquivoDeImagem =
      urlLower.includes(".jpg") ||
      urlLower.includes(".jpeg") ||
      urlLower.includes(".png") ||
      urlLower.includes(".webp");

    if (!pareceImagemInutil && pareceArquivoDeImagem) {
      imagens.push(url);
    }
  }

  return Array.from(new Set(imagens));
}

function extrairLinksPdf(html: string, baseUrl: string) {
  const regex = /href=["']([^"']+\.pdf[^"']*)["']/gi;
  const links: string[] = [];

  let match;

  while ((match = regex.exec(html)) !== null) {
    const href = match[1]?.replace(/&amp;/gi, "&").trim();

    if (!href) continue;

    try {
      const urlCompleta = new URL(href, baseUrl).toString();
      links.push(urlCompleta);
    } catch {
      // Ignora links inválidos publicados no HTML da prefeitura.
    }
  }

  return Array.from(new Set(links));
}

function normalizarTextoDocumento(url: string) {
  let texto = url;

  try {
    texto = decodeURIComponent(url);
  } catch {
    texto = url;
  }

  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function gerarTituloDocumento(url: string, index: number) {
  const texto = normalizarTextoDocumento(url);

  if (texto.includes("medicao")) {
    return `${index + 1}ª Medição`;
  }

  if (texto.includes("empenho")) {
    return "Nota de Empenho";
  }

  if (texto.includes("liquidacao")) {
    return "Liquidação";
  }

  if (texto.includes("nota") && texto.includes("fiscal")) {
    return "Nota Fiscal";
  }

  if (texto.includes("relatorio") || texto.includes("fotografico")) {
    return "Relatório Fotográfico";
  }

  if (texto.includes("contrato")) {
    return "Contrato";
  }

  return `Documento ${index + 1}`;
}

function classificarTipoDocumento(url: string) {
  const texto = normalizarTextoDocumento(url);

  if (texto.includes("medicao")) return "medicao";
  if (texto.includes("empenho")) return "empenho";
  if (texto.includes("liquidacao")) return "liquidacao";
  if (texto.includes("fiscal")) return "nota_fiscal";
  if (texto.includes("fotografico")) return "relatorio_fotografico";
  if (texto.includes("contrato")) return "contrato";

  return "documento";
}

function escolherImagemPrincipal(imagensPrefeitura: string[], tipo: string) {
  void imagensPrefeitura;

  return escolherImagemPorTipo(tipo);
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
    texto.includes("educacao") ||
    texto.includes("ensino") ||
    texto.includes("escola") ||
    texto.includes("creche") ||
    texto.includes("infância") ||
    texto.includes("infancia") ||
    texto.includes("secretaria municipal de educação")
  ) {
    return "Educação";
  }

  if (
    texto.includes("saúde") ||
    texto.includes("saude") ||
    texto.includes("samu") ||
    texto.includes("ubs") ||
    texto.includes("unidade básica") ||
    texto.includes("unidade basica") ||
    texto.includes("posto de saúde") ||
    texto.includes("posto de saude")
  ) {
    return "Saúde";
  }

  if (
    texto.includes("pavimentação") ||
    texto.includes("pavimentacao") ||
    texto.includes("asfáltica") ||
    texto.includes("asfaltica") ||
    texto.includes("asfalto") ||
    texto.includes("sinalização") ||
    texto.includes("sinalizacao") ||
    texto.includes("drenagem") ||
    texto.includes("galeria") ||
    texto.includes("galerias") ||
    texto.includes("ponte") ||
    texto.includes("estrada") ||
    texto.includes("vicinal") ||
    texto.includes("zona rural") ||
    texto.includes("saneamento") ||
    texto.includes("esgoto")
  ) {
    return "Infraestrutura";
  }

  if (
    texto.includes("praça") ||
    texto.includes("praca") ||
    texto.includes("lazer") ||
    texto.includes("parque") ||
    texto.includes("quadra") ||
    texto.includes("ginásio") ||
    texto.includes("ginasio") ||
    texto.includes("poliesportivo")
  ) {
    return "Lazer";
  }

  if (
    texto.includes("palácio") ||
    texto.includes("palacio") ||
    texto.includes("restauração") ||
    texto.includes("restauracao") ||
    texto.includes("patrimônio") ||
    texto.includes("patrimonio") ||
    texto.includes("mercado") ||
    texto.includes("mercados municipais") ||
    texto.includes("secretaria") ||
    texto.includes("prédio") ||
    texto.includes("predio") ||
    texto.includes("sede")
  ) {
    return "Patrimônio público";
  }

  return "Infraestrutura";
}

function capitalizarTitulo(texto: string) {
  return texto
    .toLowerCase()
    .split(" ")
    .map((palavra) => {
      const minusculas = [
        "de",
        "da",
        "do",
        "das",
        "dos",
        "em",
        "no",
        "na",
        "nos",
        "nas",
        "e",
      ];

      if (minusculas.includes(palavra)) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1);
    })
    .join(" ");
}

function limparTituloParaCard(titulo: string, tipo: string) {
  const original = normalizarTexto(titulo);

  const semContratos = original
    .replace(/,\s*CONFORME.*$/i, "")
    .replace(/\s*CONFORME PROCESSO.*$/i, "")
    .replace(/\s*CONTRATO ADMINISTRATIVO.*$/i, "")
    .replace(/\s*PROCESSO ADMINISTRATIVO.*$/i, "")
    .replace(/\s*TOMADA DE PREÇOS.*$/i, "")
    .replace(/\s*DISPENSA DE LICITAÇÃO.*$/i, "")
    .replace(/\s*CONCORRÊNCIA.*$/i, "")
    .replace(/\s*N[º°]\s*\d+.*$/i, "")
    .replace(/\s+NO MUNICÍPIO DE PEDREIRAS\s*-?\s*MA\.?$/i, "")
    .replace(/\s+NO MUNICIPIO DE PEDREIRAS\s*-?\s*MA\.?$/i, "")
    .replace(/\s+DO MUNICÍPIO DE PEDREIRAS\s*-?\s*MA\.?$/i, "")
    .replace(/\s+DO MUNICIPIO DE PEDREIRAS\s*-?\s*MA\.?$/i, "")
    .replace(/\s+EM PEDREIRAS\s*-?\s*MA\.?$/i, "")
    .replace(/\s+PEDREIRAS\s*-?\s*MA\.?$/i, "")
    .trim();

  const texto = semContratos.toUpperCase();

  if (
    texto.includes("MANUTENÇÃO PREDIAL") ||
    texto.includes("MANUTENÇÃO PREVENTIVA") ||
    texto.includes("MANUTENÇÃO CORRETIVA")
  ) {
    if (
      tipo === "Educação" ||
      texto.includes("EDUCAÇÃO") ||
      texto.includes("ENSINO") ||
      texto.includes("ESCOLA")
    ) {
      return "Manutenção predial em unidades da Educação";
    }

    if (
      tipo === "Saúde" ||
      texto.includes("SAÚDE") ||
      texto.includes("HOSPITAL") ||
      texto.includes("UBS")
    ) {
      return "Manutenção predial em unidades da Saúde";
    }

    return "Manutenção predial em prédios públicos";
  }

  if (
    texto.includes("MANUTENÇÃO DE TELHADOS") ||
    texto.includes("TELHADOS CERÂMICO") ||
    texto.includes("TELHADOS CERAMICO")
  ) {
    return "Manutenção de telhados nas escolas municipais";
  }

  if (
    texto.includes("MANUTENÇÃO E ADEQUAÇÃO EM INSTALAÇÕES HIDRO") ||
    texto.includes("INSTALAÇÕES HIDRO SANITÁRIAS") ||
    texto.includes("INSTALACOES HIDRO SANITARIAS")
  ) {
    return "Adequação hidrossanitária em escolas municipais";
  }

  if (
    texto.includes("MANUTENÇÃO E SUBSTITUIÇÃO DE FORRO") ||
    texto.includes("SUBSTITUIÇÃO DE FORRO") ||
    texto.includes("SUBSTITUICAO DE FORRO")
  ) {
    return "Manutenção e substituição de forro em escolas municipais";
  }

  if (
    texto.includes("JARDIM DE INFÂNCIA FÁTIMA ROMA") ||
    texto.includes("JARDIM DE INFANCIA FATIMA ROMA")
  ) {
    return "Reforma do Jardim de Infância Fátima Roma";
  }

  if (
    texto.includes("UNIDADE DE ENSINO NAÍSE TRINDADE") ||
    texto.includes("UNIDADE DE ENSINO NAISE TRINDADE")
  ) {
    return "Reforma da Unidade de Ensino Naíse Trindade";
  }

  if (
    texto.includes("UNIDADE BÁSICA DE SAÚDE") ||
    texto.includes("UNIDADE BASICA DE SAUDE") ||
    texto.includes(" UBS ") ||
    texto.includes("POSTO DE SAÚDE") ||
    texto.includes("POSTO DE SAUDE")
  ) {
    return "Construção de Unidade Básica de Saúde";
  }

  if (texto.includes("SAMU")) {
    return "Reforma e adequação da base do SAMU";
  }

  if (texto.includes("MERCADO")) {
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
    texto.includes("PONTE MISTA") ||
    texto.includes("PONTE EM SEÇÃO MISTA") ||
    texto.includes("PONTE EM ESTRUTURA METÁLICA") ||
    texto.includes("PONTE EM ESTRUTURA METALICA")
  ) {
    return "Construção de ponte";
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
    texto.includes("PAVIMENTAÇÃO") ||
    texto.includes("PAVIMENTACAO") ||
    texto.includes("ASFÁLTICA") ||
    texto.includes("ASFALTICA") ||
    texto.includes("SINALIZAÇÃO")
  ) {
    return "Pavimentação asfáltica e sinalização";
  }

  if (texto.includes("DRENAGEM")) {
    return "Implantação de sistema de drenagem";
  }

  if (
    texto.includes("PALÁCIO MUNICIPAL") ||
    texto.includes("PALACIO MUNICIPAL")
  ) {
    return "Restauração do Palácio Municipal";
  }

  if (texto.includes("SECRETARIA DE MEIO AMBIENTE")) {
    return "Construção da Secretaria de Meio Ambiente";
  }

  if (texto.includes("SECRETARIA MUNICIPAL DE EDUCAÇÃO")) {
    return "Construção da sede da Secretaria Municipal de Educação";
  }

  const tituloSemMunicipio = semContratos
    .replace(/\s+do município de pedreiras.*$/i, "")
    .replace(/\s+no município de pedreiras.*$/i, "")
    .replace(/\s+do municipio de pedreiras.*$/i, "")
    .replace(/\s+no municipio de pedreiras.*$/i, "")
    .replace(/\s+em pedreiras.*$/i, "")
    .trim();

  const tituloFinal =
    tituloSemMunicipio.length > 75
      ? `${tituloSemMunicipio.slice(0, 72).trim()}...`
      : tituloSemMunicipio;

  return capitalizarTitulo(tituloFinal);
}

function definirStatusDaObra(progresso: number, textoDetalhe: string) {
  const texto = textoDetalhe.toLowerCase();

  const temCancelamento =
    texto.includes("status: cancelada") ||
    texto.includes("status: cancelado") ||
    texto.includes("cancelada") ||
    texto.includes("cancelado");

  if (temCancelamento && progresso === 0) {
    return "Cancelada";
  }

  if (progresso >= 100) {
    return "Concluída";
  }

  if (progresso <= 0) {
    return "Em planejamento";
  }

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
    headers: headersNavegador(),
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
        headers: headersNavegador(URL_PREFEITURA),
      });

      if (!respostaDetalhe.ok) {
        continue;
      }

      const htmlDetalhe = await respostaDetalhe.text();
      const textoDetalhe = limparTexto(htmlDetalhe);
      const imagensPrefeitura = extrairImagensDaPrefeitura(htmlDetalhe);
      const documentosPrefeitura = extrairLinksPdf(htmlDetalhe, link.url);

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
      const status = definirStatusDaObra(progresso, textoDetalhe);

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
        imagem: escolherImagemPrincipal(imagensPrefeitura, tipo),
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
        imagens_prefeitura: imagensPrefeitura,
        documentos_prefeitura: documentosPrefeitura,
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

  const statusFonte = String(
    item.situacao || item.status || item.situacaoProjeto || "Não informado",
  );

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
    status: definirStatusDaObra(progressoFinal, statusFonte),
    tipo: tipoFinal,
    imagem: escolherImagemPorTipo(tipoFinal),
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

async function salvarDocumentosDaObra({
  obraId,
  linksPdf,
}: {
  obraId: string;
  linksPdf: string[];
}) {
  if (linksPdf.length === 0) return 0;

  const documentos = linksPdf.map((url, index) => ({
    obra_id: obraId,
    titulo: gerarTituloDocumento(url, index),
    url,
    tipo: classificarTipoDocumento(url),
    origem: "prefeitura",
  }));

  const { error } = await supabaseAdmin.from("obras_documentos").upsert(
    documentos,
    {
      onConflict: "obra_id,url",
    },
  );

  if (error) {
    console.error("Erro ao salvar documentos da obra:", error);
    return 0;
  }

  return documentos.length;
}

export async function POST(request: NextRequest) {
  try {
    const chaveImportacao = request.headers.get("x-import-secret");
    const importSecret = process.env.IMPORT_SECRET;
    const segredoValido = Boolean(
      importSecret && chaveImportacao === importSecret,
    );

    if (!segredoValido) {
      const auth = await exigirAdmin(request);

      if (auth.resposta) {
        return auth.resposta;
      }
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

    const obrasParaUpsert = obrasParaSalvar.map((obra) => {
      const obraSemArquivos = { ...obra };

      delete obraSemArquivos.imagens_prefeitura;
      delete obraSemArquivos.documentos_prefeitura;

      return obraSemArquivos;
    });

    const { data, error } = await supabaseAdmin
      .from("obras")
      .upsert(obrasParaUpsert, {
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

    const imagensParaInserir =
      data?.flatMap((obraSalva) => {
        const obraOriginal = obrasParaSalvar.find(
          (obra) => obra.fonte_id === obraSalva.fonte_id,
        );

        const imagens = obraOriginal?.imagens_prefeitura || [];

        return imagens.slice(0, 6).map((url, index) => ({
          obra_id: obraSalva.id,
          url,
          legenda: `Imagem oficial da obra ${obraSalva.titulo}`,
          ordem: index + 1,
        }));
      }) || [];

    const idsComImagensOficiais = Array.from(
      new Set(imagensParaInserir.map((imagem) => imagem.obra_id)),
    );

    if (imagensParaInserir.length > 0 && idsComImagensOficiais.length > 0) {
      await supabaseAdmin
        .from("obras_imagens")
        .delete()
        .in("obra_id", idsComImagensOficiais)
        .ilike("url", "%pedreiras.ma.gov.br%");

      await supabaseAdmin.from("obras_imagens").insert(imagensParaInserir);
    }

    let documentosOficiais = 0;

    if (data) {
      for (const obraSalva of data) {
        const obraOriginal = obrasParaSalvar.find(
          (obra) => obra.fonte_id === obraSalva.fonte_id,
        );

        documentosOficiais += await salvarDocumentosDaObra({
          obraId: obraSalva.id,
          linksPdf: obraOriginal?.documentos_prefeitura || [],
        });
      }
    }

    return NextResponse.json({
      mensagem: "Obras oficiais importadas/atualizadas com sucesso.",
      fontes: {
        prefeitura: obrasPrefeitura.length,
        obrasgov: obrasGov.length,
      },
      salvas: data?.length || 0,
      imagens_oficiais: imagensParaInserir.length,
      documentos_oficiais: documentosOficiais,
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
