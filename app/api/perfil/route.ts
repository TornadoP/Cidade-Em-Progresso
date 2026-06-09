import { NextResponse } from "next/server";
import { exigirUsuarioAutenticado } from "@/app/lib/apiAuth";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const auth = await exigirUsuarioAutenticado(request);

    if (auth.resposta) {
      return auth.resposta;
    }

    const usuarioUuid = auth.usuario.id;

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
      .order("created_at", { ascending: false })
      .limit(100);

    if (erroVotos) {
      return NextResponse.json({ erro: erroVotos.message }, { status: 500 });
    }

    const { data: sugestoes, error: erroSugestoes } = await supabaseAdmin
      .from("sugestoes")
      .select(
        "id, titulo, local, bairro, categoria, descricao, status, created_at",
      )
      .eq("usuario_uuid", usuarioUuid)
      .order("created_at", { ascending: false })
      .limit(50);

    if (erroSugestoes) {
      return NextResponse.json(
        { erro: erroSugestoes.message },
        { status: 500 },
      );
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
      sugestoes: sugestoes || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Erro inesperado ao carregar perfil." },
      { status: 500 },
    );
  }
}
