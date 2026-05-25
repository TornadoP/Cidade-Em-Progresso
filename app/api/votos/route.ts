import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fonteId = body.fonte_id;
    const usuarioUuid = body.usuario_uuid;

    if (!fonteId || !usuarioUuid) {
      return NextResponse.json(
        { erro: "Você precisa entrar ou se cadastrar para votar." },
        { status: 401 },
      );
    }

    const { data: obra, error: erroObra } = await supabaseAdmin
      .from("obras")
      .select("id")
      .eq("fonte_id", fonteId)
      .single();

    if (erroObra || !obra) {
      return NextResponse.json(
        { erro: "Obra não encontrada." },
        { status: 404 },
      );
    }
    const { count: votosAtivos, error: erroContagem } = await supabaseAdmin
      .from("votos")
      .select("*", { count: "exact", head: true })
      .eq("usuario_uuid", usuarioUuid)
      .eq("ativo", true);
    if (erroContagem) {
      return NextResponse.json(
        { erro: "Erro ao verificar seus votos ativos." },
        { status: 500 },
      );
    }
    if ((votosAtivos || 0) >= 5) {
      return NextResponse.json(
        {
          erro: "Você já possui 5 votos ativos. Aguarde uma obra ser concluída para votar em outra.",
        },
        { status: 403 },
      );
    }

    const { error: erroVoto } = await supabaseAdmin.from("votos").insert({
      obra_id: obra.id,
      usuario_uuid: usuarioUuid,
      usuario_id: usuarioUuid,
      ativo: true,
    });

    if (erroVoto) {
      if (erroVoto.code === "23505") {
        return NextResponse.json(
          { erro: "Você já votou nesta obra." },
          { status: 409 },
        );
      }

      return NextResponse.json({ erro: erroVoto.message }, { status: 500 });
    }

    return NextResponse.json({
      mensagem: "Voto registrado com sucesso!",
    });
  } catch {
    return NextResponse.json(
      { erro: "Erro inesperado ao registrar voto." },
      { status: 500 },
    );
  }
}
