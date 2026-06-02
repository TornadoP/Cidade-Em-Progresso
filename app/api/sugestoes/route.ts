import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";
function limitar(valor: number, minimo = 0, maximo = 100) {
  return Math.max(minimo, Math.min(valor, maximo));
}

function contemAlgumaPalavra(texto: string, palavras: string[]) {
  return palavras.some((palavra) => texto.includes(palavra));
}

function calcularIndicadoresSugestao({
  categoria,
  titulo,
  descricao,
  justificativa,
  local,
  bairro,
}: {
  categoria: string;
  titulo: string;
  descricao: string;
  justificativa: string;
  local: string;
  bairro: string;
}) {
  const texto = `
    ${categoria}
    ${titulo}
    ${descricao}
    ${justificativa}
    ${local}
    ${bairro}
  `.toLowerCase();

  let urgencia = 35;
  let impactoSocial = 35;
  let pessoasBeneficiadas = 300;

  const motivos: string[] = [];

  const temas = {
    saude: [
      "ubs",
      "posto de saúde",
      "posto de saude",
      "hospital",
      "ambulância",
      "ambulancia",
      "atendimento médico",
      "atendimento medico",
      "vacina",
      "remédio",
      "remedio",
      "dengue",
      "doença",
      "doenca",
      "gestante",
      "idoso",
      "idosos",
      "criança doente",
      "crianca doente",
    ],

    educacao: [
      "escola",
      "creche",
      "aluno",
      "alunos",
      "professor",
      "professores",
      "sala de aula",
      "educação",
      "educacao",
      "transporte escolar",
      "merenda",
      "biblioteca",
    ],

    drenagem: [
      "alagamento",
      "enchente",
      "inundação",
      "inundacao",
      "drenagem",
      "bueiro",
      "água parada",
      "agua parada",
      "rua alaga",
      "casa alaga",
      "chuva",
      "córrego",
      "corrego",
    ],

    saneamento: [
      "esgoto",
      "fossa",
      "mau cheiro",
      "água suja",
      "agua suja",
      "rede de esgoto",
      "saneamento",
      "lixo acumulado",
      "coleta de lixo",
      "falta de água",
      "falta de agua",
      "água encanada",
      "agua encanada",
    ],

    mobilidade: [
      "pavimentação",
      "pavimentacao",
      "asfalto",
      "buraco",
      "rua",
      "avenida",
      "calçada",
      "calcada",
      "ponte",
      "trânsito",
      "transito",
      "ônibus",
      "onibus",
      "parada de ônibus",
      "parada de onibus",
      "faixa de pedestre",
      "rampa",
    ],

    seguranca: [
      "escuro",
      "iluminação",
      "iluminacao",
      "poste",
      "assalto",
      "perigoso",
      "violência",
      "violencia",
      "medo",
      "matagal",
      "área abandonada",
      "area abandonada",
      "risco à noite",
      "risco a noite",
    ],

    acessibilidade: [
      "cadeirante",
      "deficiente",
      "pessoa com deficiência",
      "pessoa com deficiencia",
      "acessibilidade",
      "mobilidade reduzida",
      "idoso",
      "idosos",
      "rampa",
      "calçada quebrada",
      "calcada quebrada",
    ],

    lazer: [
      "praça",
      "praca",
      "quadra",
      "campo",
      "parque",
      "academia ao ar livre",
      "lazer",
      "esporte",
      "brincar",
      "convivência",
      "convivencia",
    ],

    economia: [
      "mercado",
      "feira",
      "comércio",
      "comercio",
      "vendedor",
      "vendedores",
      "feirante",
      "feirantes",
      "produtor",
      "produtores",
      "turismo",
      "centro comercial",
    ],

    riscoImediato: [
      "risco de acidente",
      "acidente",
      "desabamento",
      "ponte quebrada",
      "fiação exposta",
      "fiacao exposta",
      "buraco profundo",
      "cratera",
      "poste caindo",
      "muro caindo",
      "deslizamento",
      "risco de morte",
    ],

    grandeAlcance: [
      "bairro inteiro",
      "muitos moradores",
      "vários bairros",
      "varios bairros",
      "toda a cidade",
      "centenas de pessoas",
      "milhares de pessoas",
      "moradores da região",
      "moradores da regiao",
      "população",
      "populacao",
    ],
  };

  if (contemAlgumaPalavra(texto, temas.saude)) {
    impactoSocial += 35;
    urgencia += 25;
    pessoasBeneficiadas += 1500;
    motivos.push("Envolve saúde pública.");
  }

  if (contemAlgumaPalavra(texto, temas.educacao)) {
    impactoSocial += 30;
    urgencia += 15;
    pessoasBeneficiadas += 1200;
    motivos.push("Envolve educação.");
  }

  if (contemAlgumaPalavra(texto, temas.drenagem)) {
    impactoSocial += 35;
    urgencia += 35;
    pessoasBeneficiadas += 2000;
    motivos.push("Envolve drenagem, enchente ou alagamento.");
  }

  if (contemAlgumaPalavra(texto, temas.saneamento)) {
    impactoSocial += 40;
    urgencia += 30;
    pessoasBeneficiadas += 1800;
    motivos.push("Envolve saneamento básico.");
  }

  if (contemAlgumaPalavra(texto, temas.mobilidade)) {
    impactoSocial += 20;
    urgencia += 15;
    pessoasBeneficiadas += 900;
    motivos.push("Envolve mobilidade urbana.");
  }

  if (contemAlgumaPalavra(texto, temas.seguranca)) {
    impactoSocial += 25;
    urgencia += 25;
    pessoasBeneficiadas += 800;
    motivos.push("Envolve segurança urbana.");
  }

  if (contemAlgumaPalavra(texto, temas.acessibilidade)) {
    impactoSocial += 30;
    urgencia += 20;
    pessoasBeneficiadas += 500;
    motivos.push("Envolve acessibilidade ou grupos vulneráveis.");
  }

  if (contemAlgumaPalavra(texto, temas.lazer)) {
    impactoSocial += 15;
    urgencia += 5;
    pessoasBeneficiadas += 700;
    motivos.push("Envolve lazer e convivência comunitária.");
  }

  if (contemAlgumaPalavra(texto, temas.economia)) {
    impactoSocial += 20;
    urgencia += 10;
    pessoasBeneficiadas += 1000;
    motivos.push("Envolve economia local.");
  }

  if (contemAlgumaPalavra(texto, temas.riscoImediato)) {
    impactoSocial += 30;
    urgencia += 45;
    pessoasBeneficiadas += 700;
    motivos.push("Aponta risco físico imediato.");
  }

  if (contemAlgumaPalavra(texto, temas.grandeAlcance)) {
    impactoSocial += 20;
    urgencia += 10;
    pessoasBeneficiadas += 2500;
    motivos.push("Indica grande quantidade de pessoas afetadas.");
  }

  if (texto.includes("todos os dias") || texto.includes("diariamente")) {
    urgencia += 20;
    impactoSocial += 10;
    motivos.push("Problema recorrente diariamente.");
  }

  if (
    texto.includes("quando chove") ||
    texto.includes("período de chuva") ||
    texto.includes("periodo de chuva")
  ) {
    urgencia += 15;
    motivos.push("Problema associado ao período de chuva.");
  }

  if (
    texto.includes("crianças") ||
    texto.includes("criancas") ||
    texto.includes("idosos")
  ) {
    impactoSocial += 15;
    urgencia += 10;
    motivos.push("Afeta grupos vulneráveis.");
  }

  if (motivos.length === 0) {
    motivos.push("Estimativa inicial baseada nas informações fornecidas.");
  }

  return {
    urgencia: limitar(urgencia),
    impacto_social: limitar(impactoSocial),
    pessoas_beneficiadas: pessoasBeneficiadas,
    motivos_calculo: motivos,
  };
}
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const usuarioUuid = String(body.usuario_uuid || "").trim();
    const titulo = String(body.titulo || "").trim();
    const local = String(body.local || "").trim();
    const categoria = String(body.categoria || "").trim();
    const descricao = String(body.descricao || "").trim();
    const justificativa = String(body.justificativa || "").trim();
    const bairro = String(body.bairro || "").trim();
    const imagemPrincipal = String(body.imagem_principal || "").trim();
    const videoUrl = String(body.video_url || "").trim();
    const etapasSugeridas = String(body.etapas_sugeridas || "").trim();
    const transparenciaInfo = String(body.transparencia_info || "").trim();
    const orgaoSugerido = String(body.orgao_sugerido || "").trim();
    const observacoes = String(body.observacoes || "").trim();

    const imagensExtrasTexto = String(body.imagens_extras || "").trim();

    const imagensExtras = imagensExtrasTexto
      ? imagensExtrasTexto
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    const indicadores = calcularIndicadoresSugestao({
      categoria,
      titulo,
      descricao,
      justificativa,
      local,
      bairro,
    });

    if (!usuarioUuid) {
      return NextResponse.json(
        { erro: "Você precisa entrar ou se cadastrar para sugerir uma obra." },
        { status: 401 },
      );
    }

    if (!titulo || !descricao) {
      return NextResponse.json(
        { erro: "Título e descrição são obrigatórios." },
        { status: 400 },
      );
    }

    if (titulo.length < 5) {
      return NextResponse.json(
        { erro: "O título da sugestão precisa ser mais descritivo." },
        { status: 400 },
      );
    }

    if (descricao.length < 15) {
      return NextResponse.json(
        { erro: "Descreva melhor o problema ou a obra sugerida." },
        { status: 400 },
      );
    }

    const { data: usuario, error: erroUsuario } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("id", usuarioUuid)
      .maybeSingle();

    if (erroUsuario) {
      return NextResponse.json(
        { erro: "Erro ao verificar usuário." },
        { status: 500 },
      );
    }

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado. Entre novamente." },
        { status: 401 },
      );
    }

    const { data: sugestaoCriada, error: erroCriacao } = await supabaseAdmin
      .from("sugestoes")
      .insert({
        usuario_uuid: usuarioUuid,
        titulo,
        local: local || null,
        bairro: bairro || null,
        categoria: categoria || null,
        descricao,
        justificativa: justificativa || null,

        pessoas_beneficiadas: indicadores.pessoas_beneficiadas,
        urgencia: indicadores.urgencia,
        impacto_social: indicadores.impacto_social,
        motivos_calculo: indicadores.motivos_calculo,

        imagem_principal: imagemPrincipal || null,
        imagens_extras: imagensExtras.length > 0 ? imagensExtras : null,
        video_url: videoUrl || null,

        etapas_sugeridas: etapasSugeridas || null,
        transparencia_info: transparenciaInfo || null,
        orgao_sugerido: orgaoSugerido || null,
        observacoes: observacoes || null,

        status: "Em análise",
      })
      .select("id, titulo, status")
      .single();

    if (erroCriacao) {
      return NextResponse.json({ erro: erroCriacao.message }, { status: 500 });
    }

    const fonteIdSugestao = `sugestao-${sugestaoCriada.id}`;

    const { error: erroCriarObra } = await supabaseAdmin.from("obras").insert({
      fonte_id: fonteIdSugestao,
      titulo,
      local: bairro ? `${local} - ${bairro}` : local || null,

      investimento: "A definir",
      inicio: "A definir",
      prazo: "A definir",
      progresso: "0%",
      status: "Em planejamento",

      tipo: categoria || "Sugestão popular",
      imagem: imagemPrincipal || "/obra-principal.png",
      descricao,
      detalhes: justificativa || "Sugestão enviada pela população.",

      orgao: orgaoSugerido || "A definir",
      empresa: "A definir",
      ultima_atualizacao: new Date().toISOString(),

      pessoas_beneficiadas: indicadores.pessoas_beneficiadas,
      impacto_social: indicadores.impacto_social,
      urgencia: indicadores.urgencia,
      video_url: videoUrl || null,

      origem: "Sugestão popular",
      sugestao_id: sugestaoCriada.id,
    });

    if (erroCriarObra) {
      return NextResponse.json(
        {
          erro: "A sugestão foi salva, mas houve erro ao transformar em card de obra.",
          detalhe: erroCriarObra.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      mensagem:
        "Sugestão enviada com sucesso! Ela já aparece como obra em planejamento.",
      sugestao: sugestaoCriada,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Erro inesperado ao enviar sugestão." },
      { status: 500 },
    );
  }
}
