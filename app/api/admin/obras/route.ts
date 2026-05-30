import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminAutorizado =
  | {
      autorizado: true;
      email: string;
    }
  | {
      autorizado: false;
      erro: string;
      status: number;
    };

function emailsAdmins() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

async function verificarAdmin(request: NextRequest): Promise<AdminAutorizado> {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return { autorizado: false, erro: "Não autenticado.", status: 401 };
  }

  const token = authorization.replace("Bearer ", "");
  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user?.email) {
    return { autorizado: false, erro: "Usuário inválido.", status: 401 };
  }

  const emailUsuario = data.user.email.toLowerCase();
  const admins = emailsAdmins();

  if (!admins.includes(emailUsuario)) {
    return { autorizado: false, erro: "Não autorizado.", status: 403 };
  }

  return { autorizado: true, email: emailUsuario };
}

export async function PATCH(request: NextRequest) {
  const admin = await verificarAdmin(request);

  if (!admin.autorizado) {
    return NextResponse.json({ erro: admin.erro }, { status: admin.status });
  }

  const body = await request.json();
  const id = String(body.id || "");

  if (!id) {
    return NextResponse.json(
      { erro: "ID da obra é obrigatório." },
      { status: 400 },
    );
  }

  const atualizacao = {
    titulo: body.titulo,
    tipo: body.tipo,
    status: body.status,
    imagem: body.imagem,
    descricao: body.descricao,
    local: body.local,
    investimento: body.investimento,
    inicio: body.inicio,
    prazo: body.prazo,
    orgao: body.orgao,
    empresa: body.empresa,
    ultima_atualizacao: body.ultima_atualizacao,
  };

  const camposLimpos = Object.fromEntries(
    Object.entries(atualizacao).filter(([, valor]) => valor !== undefined),
  );

  const { data, error } = await supabaseAdmin
    .from("obras")
    .update(camposLimpos)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      {
        erro: "Erro ao atualizar obra.",
        detalhes: error.message,
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    mensagem: "Obra atualizada com sucesso.",
    obra: data,
  });
}
