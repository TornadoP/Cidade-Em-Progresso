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
        categoria: categoria || null,
        descricao,
        justificativa: justificativa || null,
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
