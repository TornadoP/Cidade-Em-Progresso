import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function limparVotos(usuarioId: string) {
  const { error: erroUsuarioUuid } = await supabaseAdmin
    .from("votos")
    .delete()
    .eq("usuario_uuid", usuarioId);

  if (erroUsuarioUuid) {
    return erroUsuarioUuid;
  }

  const { error: erroUsuarioId } = await supabaseAdmin
    .from("votos")
    .delete()
    .eq("usuario_id", usuarioId);

  return erroUsuarioId;
}

async function anonimizarSugestoes(usuarioId: string) {
  const { error } = await supabaseAdmin
    .from("sugestoes")
    .update({ usuario_uuid: null })
    .eq("usuario_uuid", usuarioId);

  return error;
}

export async function DELETE(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { erro: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    const token = authorization.replace("Bearer ", "");

    const { data: authData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json({ erro: "Sessão inválida." }, { status: 401 });
    }

    const authUserId = authData.user.id;

    const { data: usuarioPerfil, error: erroPerfil } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("id", authUserId)
      .maybeSingle();

    if (erroPerfil) {
      return NextResponse.json(
        {
          erro: "Erro ao localizar perfil do usuário.",
          detalhes: erroPerfil.message,
        },
        { status: 500 },
      );
    }

    const idsUsuario = Array.from(
      new Set([authUserId, usuarioPerfil?.id].filter(Boolean)),
    );

    for (const usuarioId of idsUsuario) {
      const erroVotos = await limparVotos(usuarioId);

      if (erroVotos) {
        return NextResponse.json(
          {
            erro: "Erro ao remover votos do usuário.",
            detalhes: erroVotos.message,
          },
          { status: 500 },
        );
      }

      const erroSugestoes = await anonimizarSugestoes(usuarioId);

      if (erroSugestoes) {
        return NextResponse.json(
          {
            erro: "Erro ao anonimizar sugestões do usuário.",
            detalhes: erroSugestoes.message,
          },
          { status: 500 },
        );
      }
    }

    if (usuarioPerfil?.id) {
      const { error: erroExcluirPerfil } = await supabaseAdmin
        .from("usuarios")
        .delete()
        .eq("id", usuarioPerfil.id);

      if (erroExcluirPerfil) {
        return NextResponse.json(
          {
            erro: "Erro ao excluir perfil do usuário.",
            detalhes: erroExcluirPerfil.message,
          },
          { status: 500 },
        );
      }
    }

    const { error: deleteAuthError } =
      await supabaseAdmin.auth.admin.deleteUser(authUserId);

    if (deleteAuthError) {
      return NextResponse.json(
        {
          erro: "Erro ao excluir conta do usuário.",
          detalhes: deleteAuthError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      mensagem: "Conta excluída com sucesso.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        erro:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao excluir conta.",
      },
      { status: 500 },
    );
  }
}
