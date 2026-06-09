import { NextResponse } from "next/server";
import { exigirUsuarioAutenticado } from "@/app/lib/apiAuth";
import { aplicarRateLimit } from "@/app/lib/rateLimit";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

const TIPOS_IMAGEM_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TIPOS_VIDEO_PERMITIDOS = ["video/mp4", "video/webm", "video/quicktime"];
const EXTENSOES_POR_TIPO = {
  imagem: ["jpg", "jpeg", "png", "webp"],
  video: ["mp4", "webm", "mov"],
};

const LIMITE_IMAGEM = 5 * 1024 * 1024;
const LIMITE_VIDEO = 50 * 1024 * 1024;

function obterExtensao(nomeArquivo: string) {
  const partes = nomeArquivo.split(".");
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

function validarAssinaturaArquivo(
  bytes: Uint8Array,
  tipo: string,
  extensao: string,
) {
  if (pareceHtmlOuSvg(bytes)) return false;

  if (tipo === "imagem") {
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
  }

  if (tipo === "video") {
    if (extensao === "webm") {
      return bytesComecamCom(bytes, [0x1a, 0x45, 0xdf, 0xa3]);
    }

    if (["mp4", "mov"].includes(extensao)) {
      return bytesParaTexto(bytes.slice(4, 8)) === "ftyp";
    }
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const auth = await exigirUsuarioAutenticado(request);

    if (auth.resposta) {
      return auth.resposta;
    }

    const usuarioUuid = auth.usuario.id;

    const limiteRequisicoes = await aplicarRateLimit({
      chave: usuarioUuid,
      rota: "/api/uploads",
      limite: 10,
      janelaSegundos: 60 * 60,
    });

    if (limiteRequisicoes) {
      return limiteRequisicoes;
    }

    const formData = await request.formData();

    const arquivo = formData.get("arquivo");
    const tipo = String(formData.get("tipo") || "").trim();

    if (!(arquivo instanceof File)) {
      return NextResponse.json(
        { erro: "Nenhum arquivo enviado." },
        { status: 400 },
      );
    }

    const { data: usuario, error: erroUsuario } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("id", usuarioUuid)
      .maybeSingle();

    if (erroUsuario) {
      return NextResponse.json(
        { erro: "Erro ao verificar usuário." },
        { status: 500 },
      );
    }

    if (!usuario) {
      return NextResponse.json(
        { erro: "Usuário não encontrado. Entre novamente." },
        { status: 401 },
      );
    }

    let bucket = "";
    let limite = 0;
    let tiposPermitidos: string[] = [];
    let extensoesPermitidas: string[] = [];

    if (tipo === "imagem") {
      bucket = "sugestoes-imagens";
      limite = LIMITE_IMAGEM;
      tiposPermitidos = TIPOS_IMAGEM_PERMITIDOS;
      extensoesPermitidas = EXTENSOES_POR_TIPO.imagem;
    }

    if (tipo === "video") {
      bucket = "sugestoes-videos";
      limite = LIMITE_VIDEO;
      tiposPermitidos = TIPOS_VIDEO_PERMITIDOS;
      extensoesPermitidas = EXTENSOES_POR_TIPO.video;
    }

    if (!bucket) {
      return NextResponse.json(
        { erro: "Tipo de upload inválido." },
        { status: 400 },
      );
    }

    if (!tiposPermitidos.includes(arquivo.type)) {
      return NextResponse.json(
        { erro: "Tipo de arquivo não permitido." },
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

    if (!extensoesPermitidas.includes(extensao)) {
      return NextResponse.json(
        { erro: "Extensão de arquivo não permitida." },
        { status: 400 },
      );
    }

    if (arquivo.size > limite) {
      return NextResponse.json(
        {
          erro:
            tipo === "imagem"
              ? "A imagem deve ter no máximo 5 MB."
              : "O vídeo deve ter no máximo 50 MB.",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await arquivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const assinaturaValida = validarAssinaturaArquivo(
      new Uint8Array(arrayBuffer.slice(0, 512)),
      tipo,
      extensao,
    );

    if (!assinaturaValida) {
      return NextResponse.json(
        { erro: "O conteúdo do arquivo não corresponde ao formato enviado." },
        { status: 400 },
      );
    }

    const nomeFinal = `${usuarioUuid}/${crypto.randomUUID()}.${extensao}`;

    const { error: erroUpload } = await supabaseAdmin.storage
      .from(bucket)
      .upload(nomeFinal, buffer, {
        contentType: arquivo.type,
        upsert: false,
      });

    if (erroUpload) {
      return NextResponse.json({ erro: erroUpload.message }, { status: 500 });
    }

    const { data: urlPublica } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(nomeFinal);

    return NextResponse.json({
      mensagem: "Upload realizado com sucesso.",
      url: urlPublica.publicUrl,
      caminho: nomeFinal,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Erro inesperado ao fazer upload." },
      { status: 500 },
    );
  }
}
