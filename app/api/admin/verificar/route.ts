import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function emailsAdmins() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
  }

  const token = authorization.replace("Bearer ", "");
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user?.email) {
    return NextResponse.json({ erro: "Usuário inválido." }, { status: 401 });
  }

  const emailUsuario = data.user.email.toLowerCase();
  const admins = emailsAdmins();

  if (!admins.includes(emailUsuario)) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 403 });
  }

  return NextResponse.json({
    autorizado: true,
    email: emailUsuario,
  });
}
