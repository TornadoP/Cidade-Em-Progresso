import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type UsuarioAutenticado = {
  id: string;
  email: string | null;
};

type ResultadoAuth =
  | {
      usuario: UsuarioAutenticado;
      resposta?: never;
    }
  | {
      usuario?: never;
      resposta: NextResponse;
    };

function obterToken(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return "";
  }

  return authHeader.replace("Bearer ", "").trim();
}

export async function exigirUsuarioAutenticado(
  request: Request,
): Promise<ResultadoAuth> {
  const token = obterToken(request);

  if (!token) {
    return {
      resposta: NextResponse.json(
        { erro: "Não autorizado." },
        { status: 401 },
      ),
    };
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    return {
      resposta: NextResponse.json(
        { erro: "Sessão inválida." },
        { status: 401 },
      ),
    };
  }

  return {
    usuario: {
      id: user.id,
      email: user.email || null,
    },
  };
}

function emailsAdmins() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function exigirAdmin(request: Request): Promise<ResultadoAuth> {
  const auth = await exigirUsuarioAutenticado(request);

  if (auth.resposta) {
    return auth;
  }

  const emailUsuario = auth.usuario.email?.toLowerCase();

  if (!emailUsuario || !emailsAdmins().includes(emailUsuario)) {
    return {
      resposta: NextResponse.json(
        { erro: "Não autorizado." },
        { status: 403 },
      ),
    };
  }

  return auth;
}
