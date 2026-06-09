import { NextResponse } from "next/server";
import { exigirAdmin } from "@/app/lib/apiAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const auth = await exigirAdmin(request);

  if (auth.resposta) {
    return auth.resposta;
  }

  return NextResponse.json(
    {
      erro: "Edição direta de obras foi desativada. Dados oficiais não devem ser alterados manualmente.",
    },
    { status: 403 },
  );
}
