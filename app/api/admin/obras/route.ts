import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH() {
  return NextResponse.json(
    {
      erro: "Edição direta de obras foi desativada. Dados oficiais não devem ser alterados manualmente.",
    },
    { status: 403 },
  );
}
