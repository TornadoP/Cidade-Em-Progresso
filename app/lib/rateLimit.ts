import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

type RateLimitOptions = {
  chave: string;
  rota: string;
  limite: number;
  janelaSegundos: number;
};

function segundosParaTexto(segundos: number) {
  if (segundos >= 3600) {
    const horas = Math.ceil(segundos / 3600);
    return `${horas} hora${horas === 1 ? "" : "s"}`;
  }

  const minutos = Math.ceil(segundos / 60);
  return `${minutos} minuto${minutos === 1 ? "" : "s"}`;
}

export function obterIpCliente(request: Request) {
  const encaminhado = request.headers.get("x-forwarded-for");
  const ipEncaminhado = encaminhado?.split(",")[0]?.trim();

  return (
    ipEncaminhado ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "ip-desconhecido"
  );
}

export async function aplicarRateLimit({
  chave,
  rota,
  limite,
  janelaSegundos,
}: RateLimitOptions) {
  const desde = new Date(Date.now() - janelaSegundos * 1000).toISOString();

  const { count, error: erroContagem } = await supabaseAdmin
    .from("limites_requisicoes")
    .select("id", { count: "exact", head: true })
    .eq("chave", chave)
    .eq("rota", rota)
    .gte("created_at", desde);

  if (erroContagem) {
    return NextResponse.json(
      { erro: "Erro ao verificar limite de requisições." },
      { status: 500 },
    );
  }

  if ((count || 0) >= limite) {
    return NextResponse.json(
      {
        erro: `Muitas tentativas. Aguarde ${segundosParaTexto(
          janelaSegundos,
        )} antes de tentar novamente.`,
      },
      { status: 429 },
    );
  }

  const { error: erroRegistro } = await supabaseAdmin
    .from("limites_requisicoes")
    .insert({
      chave,
      rota,
    });

  if (erroRegistro) {
    return NextResponse.json(
      { erro: "Erro ao registrar limite de requisições." },
      { status: 500 },
    );
  }

  return null;
}
