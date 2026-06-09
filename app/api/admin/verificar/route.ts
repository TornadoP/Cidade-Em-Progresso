import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/app/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await exigirAdmin(request);

  if (auth.resposta) {
    return auth.resposta;
  }

  return NextResponse.json({
    autorizado: true,
    email: auth.usuario.email,
  });
}
