import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin, exigirUsuarioAutenticado } from "@/app/lib/apiAuth";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function usuarioPodeEditarObra({
  obraId,
  usuarioUuid,
  usuarioEhAdmin,
}: {
  obraId: string;
  usuarioUuid: string;
  usuarioEhAdmin: boolean;
}) {
  const { data: obra } = await supabaseAdmin
    .from("obras")
    .select("id, origem, sugestao_id")
    .eq("id", obraId)
    .single();

  if (!obra) {
    return false;
  }

  if (usuarioEhAdmin) {
    return true;
  }

  if (obra.origem !== "Sugestão popular" || !obra.sugestao_id) {
    return false;
  }

  const { data: sugestao } = await supabaseAdmin
    .from("sugestoes")
    .select("id, usuario_uuid")
    .eq("id", obra.sugestao_id)
    .single();

  return sugestao?.usuario_uuid === usuarioUuid;
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await exigirUsuarioAutenticado(request);

  if (auth.resposta) {
    return auth.resposta;
  }

  const authAdmin = await exigirAdmin(request);
  const usuarioEhAdmin = !authAdmin.resposta;
  const { id: obraId } = await context.params;
  const body = await request.json().catch(() => null);
  const imagemId = String(body?.imagemId || "");

  if (!imagemId) {
    return NextResponse.json(
      { erro: "Imagem não informada." },
      { status: 400 },
    );
  }

  const podeEditar = await usuarioPodeEditarObra({
    obraId,
    usuarioUuid: auth.usuario.id,
    usuarioEhAdmin,
  });

  if (!podeEditar) {
    return NextResponse.json(
      { erro: "Você não tem permissão para alterar esta obra." },
      { status: 403 },
    );
  }

  const { data: imagem, error: erroImagem } = await supabaseAdmin
    .from("obras_imagens")
    .select("id, obra_id, url, tipo")
    .eq("id", imagemId)
    .eq("obra_id", obraId)
    .single();

  if (erroImagem || !imagem) {
    return NextResponse.json(
      { erro: "Imagem não encontrada." },
      { status: 404 },
    );
  }

  if (imagem.tipo === "video") {
    return NextResponse.json(
      { erro: "Vídeo não pode ser usado como imagem principal." },
      { status: 400 },
    );
  }

  await supabaseAdmin
    .from("obras_imagens")
    .update({ eh_principal: false })
    .eq("obra_id", obraId);

  await supabaseAdmin
    .from("obras_imagens")
    .update({ eh_principal: true })
    .eq("id", imagemId);

  const { error: erroObra } = await supabaseAdmin
    .from("obras")
    .update({
      imagem: imagem.url,
      updated_at: new Date().toISOString(),
    })
    .eq("id", obraId);

  if (erroObra) {
    return NextResponse.json(
      { erro: "Erro ao atualizar imagem principal." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    mensagem: "Imagem principal atualizada com sucesso.",
    url: imagem.url,
  });
}
