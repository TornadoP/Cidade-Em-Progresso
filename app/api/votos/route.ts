import { NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabaseClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fonteId = body.fonte_id;
    const usuarioId = body.usuario_id;

    if (!fonteId || !usuarioId) {
      return NextResponse.json(
        { erro: "Dados incompletos para registrar voto." },
        { status: 400 },
      );
    }

    const { data: obra, error: erroObra } = await supabase
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

    const { error: erroVoto } = await supabase.from("votos").insert({
      obra_id: obra.id,
      usuario_id: usuarioId,
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
