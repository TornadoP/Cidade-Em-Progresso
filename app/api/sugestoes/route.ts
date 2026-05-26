import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

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

    const pessoasBeneficiadas = Number(body.pessoas_beneficiadas || 0);
    const urgencia = Number(body.urgencia || 50);
    const impactoSocial = Number(body.impacto_social || 50);

    const imagensExtrasTexto = String(body.imagens_extras || "").trim();

    const imagensExtras = imagensExtrasTexto
      ? imagensExtrasTexto
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

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

        pessoas_beneficiadas: pessoasBeneficiadas,
        urgencia,
        impacto_social: impactoSocial,

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

    return NextResponse.json({
      mensagem: "Sugestão enviada com sucesso!",
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
