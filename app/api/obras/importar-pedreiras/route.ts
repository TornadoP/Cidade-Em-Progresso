import { NextResponse } from "next/server";
import { obras } from "@/app/data/obras-backup";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

function montarObraPedreiras(obra: (typeof obras)[number]) {
  return {
    fonte_id: obra.id,
    titulo: obra.titulo,
    local: obra.local,
    investimento: obra.investimento,
    inicio: obra.inicio,
    prazo: obra.prazo,
    progresso: obra.progresso,
    status: obra.status,
    tipo: obra.tipo,
    imagem: obra.imagem,
    descricao: obra.descricao,
    detalhes: obra.detalhes,
    orgao: obra.orgao,
    empresa: obra.empresa,
    ultima_atualizacao: obra.ultimaAtualizacao,
    origem: "Oficial",
  };
}

export async function POST() {
  try {
    const obrasPedreiras = obras.map(montarObraPedreiras);
    const fonteIds = obrasPedreiras.map((obra) => obra.fonte_id);

    const { data: obrasExistentes, error: erroBusca } = await supabaseAdmin
      .from("obras")
      .select("fonte_id")
      .in("fonte_id", fonteIds);

    if (erroBusca) {
      return NextResponse.json({ erro: erroBusca.message }, { status: 500 });
    }

    const fonteIdsExistentes = new Set(
      (obrasExistentes || [])
        .map((obra) => obra.fonte_id)
        .filter((fonteId): fonteId is string => Boolean(fonteId)),
    );

    const obrasParaImportar = obrasPedreiras.filter(
      (obra) => !fonteIdsExistentes.has(obra.fonte_id),
    );

    if (obrasParaImportar.length === 0) {
      return NextResponse.json({
        mensagem: "Todas as obras de Pedreiras já foram importadas.",
        importadas: 0,
        ignoradas: obrasPedreiras.length,
        total: obrasPedreiras.length,
      });
    }

    const { data: obrasImportadas, error: erroImportacao } = await supabaseAdmin
      .from("obras")
      .insert(obrasParaImportar)
      .select("id, fonte_id, titulo");

    if (erroImportacao) {
      return NextResponse.json(
        { erro: erroImportacao.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      mensagem: "Obras de Pedreiras importadas com sucesso.",
      importadas: obrasImportadas?.length || 0,
      ignoradas: obrasPedreiras.length - obrasParaImportar.length,
      total: obrasPedreiras.length,
      obras: obrasImportadas || [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Erro inesperado ao importar obras de Pedreiras." },
      { status: 500 },
    );
  }
}
