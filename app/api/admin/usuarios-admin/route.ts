import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/app/lib/apiAuth";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function obterEmailsAdminFixos() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const auth = await exigirAdmin(request);

  if (auth.resposta) {
    return auth.resposta;
  }

  const { data, error } = await supabaseAdmin
    .from("admin_users")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { erro: "Erro ao buscar administradores." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    admins_fixos: obterEmailsAdminFixos().map((email) => ({
      email,
      tipo: "fixo",
      removivel: false,
    })),
    admins_dinamicos: (data || []).map((admin) => ({
      ...admin,
      tipo: "dinamico",
      removivel: true,
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await exigirAdmin(request);

  if (auth.resposta) {
    return auth.resposta;
  }

  const body = await request.json().catch(() => null);
  const email = String(body?.email || "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.json(
      { erro: "Informe um email válido." },
      { status: 400 },
    );
  }

  const emailsFixos = obterEmailsAdminFixos();

  if (emailsFixos.includes(email)) {
    return NextResponse.json(
      { erro: "Este email já é admin fixo pelo sistema." },
      { status: 400 },
    );
  }

  const { error } = await supabaseAdmin.from("admin_users").upsert(
    {
      email,
      criado_por: auth.usuario.id,
    },
    {
      onConflict: "email",
    },
  );

  if (error) {
    return NextResponse.json(
      { erro: "Erro ao adicionar administrador." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    mensagem: "Administrador adicionado com sucesso.",
  });
}
