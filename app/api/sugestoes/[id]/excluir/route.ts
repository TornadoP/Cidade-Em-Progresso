import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params;

    const body = await request.json().catch(() => null);
    const usuarioUuid = String(body?.usuario_uuid || "").trim();

    if (!usuarioUuid) {
      return NextResponse.json(
        { erro: "Usuário não informado." },
        { status: 401 },
      );
    }

    if (!id) {
      return NextResponse.json(
        { erro: "Sugestão não informada." },
        { status: 400 },
      );
    }

    const { data: sugestao, error: erroSugestao } = await supabaseAdmin
      .from("sugestoes")
      .select("id, usuario_uuid")
      .eq("id", id)
      .maybeSingle();

    if (erroSugestao) {
      return NextResponse.json(
        { erro: "Erro ao buscar sugestão." },
        { status: 500 },
      );
    }

    if (!sugestao) {
      return NextResponse.json(
        { erro: "Sugestão não encontrada." },
        { status: 404 },
      );
    }

    if (sugestao.usuario_uuid !== usuarioUuid) {
      return NextResponse.json(
        { erro: "Você só pode excluir sugestões criadas por você." },
        { status: 403 },
      );
    }

    const { data: obraVinculada, error: erroObra } = await supabaseAdmin
      .from("obras")
      .select("id, origem, sugestao_id")
      .eq("sugestao_id", id)
      .eq("origem", "Sugestão popular")
      .maybeSingle();

    if (erroObra) {
      return NextResponse.json(
        { erro: "Erro ao buscar obra vinculada." },
        { status: 500 },
      );
    }

    if (obraVinculada) {
      const { error: erroExcluirVotos } = await supabaseAdmin
        .from("votos")
        .delete()
        .eq("obra_id", obraVinculada.id);

      if (erroExcluirVotos) {
        return NextResponse.json(
          { erro: "Erro ao excluir votos da sugestão." },
          { status: 500 },
        );
      }

      const { error: erroExcluirObra } = await supabaseAdmin
        .from("obras")
        .delete()
        .eq("id", obraVinculada.id)
        .eq("origem", "Sugestão popular");

      if (erroExcluirObra) {
        return NextResponse.json(
          { erro: "Erro ao excluir obra vinculada." },
          { status: 500 },
        );
      }
    }

    const { error: erroExcluirSugestao } = await supabaseAdmin
      .from("sugestoes")
      .delete()
      .eq("id", id)
      .eq("usuario_uuid", usuarioUuid);

    if (erroExcluirSugestao) {
      return NextResponse.json(
        { erro: "Erro ao excluir sugestão." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      mensagem: "Sugestão excluída com sucesso.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Erro inesperado ao excluir sugestão." },
      { status: 500 },
    );
  }
}
