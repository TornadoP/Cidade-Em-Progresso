import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/app/lib/apiAuth";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await exigirAdmin(request);

  if (auth.resposta) {
    return auth.resposta;
  }

  const { id } = await context.params;

  const { data: adminParaRemover, error: erroBusca } = await supabaseAdmin
    .from("admin_users")
    .select("id, email")
    .eq("id", id)
    .single();

  if (erroBusca || !adminParaRemover) {
    return NextResponse.json(
      { erro: "Administrador não encontrado." },
      { status: 404 },
    );
  }

  if (adminParaRemover.email === auth.email) {
    return NextResponse.json(
      { erro: "Você não pode remover seu próprio acesso admin." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin
    .from("admin_users")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { erro: "Erro ao remover administrador." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    mensagem: "Administrador removido com sucesso.",
  });
}
