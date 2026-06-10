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

function pareceUuid(valor: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    valor,
  );
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

  const chaveEhUuid = pareceUuid(chave);

  let consulta = supabaseAdmin
    .from("limites_requisicoes")
    .select("id", { count: "exact", head: true })
    .eq("acao", rota)
    .gte("created_at", desde);

  if (chaveEhUuid) {
    consulta = consulta.eq("usuario_uuid", chave);
  } else {
    consulta = consulta.eq("ip", chave);
  }

  const { count, error: erroContagem } = await consulta;

  if (erroContagem) {
    console.error("Erro ao verificar rate limit:", erroContagem);

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
      usuario_uuid: chaveEhUuid ? chave : null,
      ip: chaveEhUuid ? null : chave,
      acao: rota,
    });

  if (erroRegistro) {
    console.error("Erro ao registrar rate limit:", erroRegistro);

    return NextResponse.json(
      { erro: "Erro ao registrar limite de requisições." },
      { status: 500 },
    );
  }

  return null;
}
