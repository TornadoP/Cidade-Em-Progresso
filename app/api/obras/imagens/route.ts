import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "obras-imagens";
const TIPOS_IMAGEM_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TAMANHO_MAXIMO_MB = 5;
const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 1024 * 1024;

function gerarNomeArquivo(nomeOriginal: string) {
  const extensao = nomeOriginal.split(".").pop()?.toLowerCase() || "jpg";

  return `${crypto.randomUUID()}.${extensao}`;
}

export async function POST(request: NextRequest) {
  try {
    const uploadSecret = process.env.UPLOAD_SECRET;
    const chaveUpload = request.headers.get("x-upload-secret");

    if (!uploadSecret) {
      return NextResponse.json(
        { erro: "UPLOAD_SECRET não foi configurada." },
        { status: 500 },
      );
    }

    if (chaveUpload !== uploadSecret) {
      return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
    }

    const formData = await request.formData();

    const obraId = String(formData.get("obra_id") || "").trim();
    const legenda = String(formData.get("legenda") || "").trim();
    const ordem = Number(formData.get("ordem") || 0);
    const arquivo = formData.get("arquivo");

    if (!obraId) {
      return NextResponse.json(
        { erro: "obra_id é obrigatório." },
        { status: 400 },
      );
    }

    if (!(arquivo instanceof File)) {
      return NextResponse.json(
        { erro: "Arquivo de imagem é obrigatório." },
        { status: 400 },
      );
    }

    if (!TIPOS_IMAGEM_PERMITIDOS.includes(arquivo.type)) {
      return NextResponse.json(
        { erro: "Envie apenas imagens JPG, PNG ou WEBP." },
        { status: 400 },
      );
    }

    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      return NextResponse.json(
        { erro: `A imagem deve ter no máximo ${TAMANHO_MAXIMO_MB} MB.` },
        { status: 400 },
      );
    }

    const nomeArquivo = gerarNomeArquivo(arquivo.name);
    const caminho = `${obraId}/${nomeArquivo}`;
    const arrayBuffer = await arquivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: erroUpload } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(caminho, buffer, {
        contentType: arquivo.type,
        upsert: false,
      });

    if (erroUpload) {
      return NextResponse.json(
        {
          etapa: "upload storage",
          erro: erroUpload.message,
        },
        { status: 500 },
      );
    }

    const { data: urlPublica } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(caminho);

    const { data: imagemCriada, error: erroBanco } = await supabaseAdmin
      .from("obras_imagens")
      .insert({
        obra_id: obraId,
        url: urlPublica.publicUrl,
        legenda: legenda || null,
        ordem: Number.isNaN(ordem) ? 0 : ordem,
      })
      .select("id, obra_id, url, legenda, ordem")
      .single();

    if (erroBanco) {
      return NextResponse.json(
        {
          etapa: "salvar imagem no banco",
          erro: erroBanco.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      mensagem: "Imagem da obra enviada com sucesso.",
      imagem: imagemCriada,
    });
  } catch (error) {
    return NextResponse.json(
      {
        etapa: "erro inesperado",
        erro:
          error instanceof Error
            ? error.message
            : "Erro inesperado ao enviar imagem.",
      },
      { status: 500 },
    );
  }
}
