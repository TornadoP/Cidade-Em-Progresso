import { NextResponse } from "next/server";
import { exigirUsuarioAutenticado } from "@/app/lib/apiAuth";
import { aplicarRateLimit, obterIpCliente } from "@/app/lib/rateLimit";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fonteId = body.fonte_id;

    if (!fonteId) {
      return NextResponse.json(
        { erro: "Obra não informada." },
        { status: 400 },
      );
    }

    const limite = await aplicarRateLimit({
      chave: obterIpCliente(request),
      rota: "/api/votos",
      limite: 10,
      janelaSegundos: 60,
    });

    if (limite) {
      return limite;
    }

    const auth = await exigirUsuarioAutenticado(request);

    if (auth.resposta) {
      return auth.resposta;
    }

    const usuarioUuid = auth.usuario.id;

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
        {
          erro: "Sua sessão expirou ou seu usuário não existe mais. Entre novamente para votar.",
        },
        { status: 401 },
      );
    }
    const { count: votosAtivos, error: erroContagem } = await supabaseAdmin
      .from("votos")
      .select("id", { count: "exact", head: true })
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
