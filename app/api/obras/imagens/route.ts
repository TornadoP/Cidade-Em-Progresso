import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin } from "@/app/lib/apiAuth";
import { aplicarRateLimit } from "@/app/lib/rateLimit";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "obras-imagens";
const TIPOS_IMAGEM_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const EXTENSOES_IMAGEM_PERMITIDAS = ["jpg", "jpeg", "png", "webp"];
const TAMANHO_MAXIMO_MB = 5;
const TAMANHO_MAXIMO_BYTES = TAMANHO_MAXIMO_MB * 1024 * 1024;

function obterExtensao(nomeOriginal: string) {
  const partes = nomeOriginal.split(".");
  const extensao = partes[partes.length - 1];

  if (partes.length < 2 || !extensao) {
    return "";
  }

  return extensao.toLowerCase();
}

function bytesComecamCom(bytes: Uint8Array, assinatura: number[]) {
  return assinatura.every((valor, indice) => bytes[indice] === valor);
}

function bytesParaTexto(bytes: Uint8Array) {
  return new TextDecoder()
    .decode(bytes)
    .replace(/\0/g, "")
    .trim()
    .toLowerCase();
}

function pareceHtmlOuSvg(bytes: Uint8Array) {
  const texto = bytesParaTexto(bytes.slice(0, 256));

  return (
    texto.startsWith("<!doctype html") ||
    texto.startsWith("<html") ||
    texto.startsWith("<script") ||
    texto.startsWith("<?xml") ||
    texto.includes("<svg")
  );
}

function validarAssinaturaImagem(bytes: Uint8Array, extensao: string) {
  if (pareceHtmlOuSvg(bytes)) return false;

  if (["jpg", "jpeg"].includes(extensao)) {
    return bytesComecamCom(bytes, [0xff, 0xd8, 0xff]);
  }

  if (extensao === "png") {
    return bytesComecamCom(bytes, [
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
    ]);
  }

  if (extensao === "webp") {
    const riff = bytesParaTexto(bytes.slice(0, 4)) === "riff";
    const webp = bytesParaTexto(bytes.slice(8, 12)) === "webp";

    return riff && webp;
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await exigirAdmin(request);

    if (auth.resposta) {
      return auth.resposta;
    }

    const limite = await aplicarRateLimit({
      chave: auth.usuario.id,
      rota: "/api/obras/imagens",
      limite: 20,
      janelaSegundos: 60 * 60,
    });

    if (limite) {
      return limite;
    }

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

    const extensao = obterExtensao(arquivo.name);

    if (!extensao) {
      return NextResponse.json(
        { erro: "Arquivo sem extensão não é permitido." },
        { status: 400 },
      );
    }

    if (!EXTENSOES_IMAGEM_PERMITIDAS.includes(extensao)) {
      return NextResponse.json(
        { erro: "Extensão de imagem não permitida." },
        { status: 400 },
      );
    }

    if (arquivo.size > TAMANHO_MAXIMO_BYTES) {
      return NextResponse.json(
        { erro: `A imagem deve ter no máximo ${TAMANHO_MAXIMO_MB} MB.` },
        { status: 400 },
      );
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const assinaturaValida = validarAssinaturaImagem(
      new Uint8Array(arrayBuffer.slice(0, 512)),
      extensao,
    );

    if (!assinaturaValida) {
      return NextResponse.json(
        { erro: "O conteúdo do arquivo não corresponde ao formato enviado." },
        { status: 400 },
      );
    }

    const caminho = `${obraId}/${crypto.randomUUID()}.${extensao}`;

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
