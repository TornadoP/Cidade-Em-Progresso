import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const usuarioUuid = String(body.usuario_uuid || "").trim();

    if (!usuarioUuid) {
      return NextResponse.json(
        { erro: "Usuário não informado." },
        { status: 401 },
      );
    }

    const { data: usuario, error: erroUsuario } = await supabaseAdmin
      .from("usuarios")
      .select("id, nome, telefone, email, created_at")
      .eq("id", usuarioUuid)
      .maybeSingle();

    if (erroUsuario) {
      return NextResponse.json({ erro: erroUsuario.message }, { status: 500 });
    }

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado. Entre novamente." },
        { status: 401 },
      );
    }

    const { data: votos, error: erroVotos } = await supabaseAdmin
      .from("votos")
      .select(
        `
        id,
        ativo,
        created_at,
        obras (
          id,
          fonte_id,
          titulo,
          local,
          status,
          progresso,
          tipo,
          imagem
        )
      `,
      )
      .eq("usuario_uuid", usuarioUuid)
      .order("created_at", { ascending: false });

    if (erroVotos) {
      return NextResponse.json({ erro: erroVotos.message }, { status: 500 });
    }

    const votosAtivos = (votos || []).filter((voto) => voto.ativo === true);
    const totalVotos = votos?.length || 0;
    const limiteVotosAtivos = 5;
    const votosRestantes = Math.max(limiteVotosAtivos - votosAtivos.length, 0);

    return NextResponse.json({
      usuario,
      resumo: {
        limite_votos_ativos: limiteVotosAtivos,
        votos_ativos: votosAtivos.length,
        votos_restantes: votosRestantes,
        total_votos: totalVotos,
      },
      votos: votos || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Erro inesperado ao carregar perfil." },
      { status: 500 },
    );
  }
}
