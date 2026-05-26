import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";

const TIPOS_IMAGEM_PERMITIDOS = ["image/jpeg", "image/png", "image/webp"];
const TIPOS_VIDEO_PERMITIDOS = ["video/mp4", "video/webm", "video/quicktime"];

const LIMITE_IMAGEM = 5 * 1024 * 1024;
const LIMITE_VIDEO = 50 * 1024 * 1024;

function obterExtensao(nomeArquivo: string) {
  const partes = nomeArquivo.split(".");
  const extensao = partes[partes.length - 1];

  return extensao ? extensao.toLowerCase() : "arquivo";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const arquivo = formData.get("arquivo");
    const tipo = String(formData.get("tipo") || "").trim();
    const usuarioUuid = String(formData.get("usuario_uuid") || "").trim();

    if (!usuarioUuid) {
      return NextResponse.json(
        { erro: "Usuário não informado." },
        { status: 401 },
      );
    }

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

    if (tipo === "imagem") {
      bucket = "sugestoes-imagens";
      limite = LIMITE_IMAGEM;
      tiposPermitidos = TIPOS_IMAGEM_PERMITIDOS;
    }

    if (tipo === "video") {
      bucket = "sugestoes-videos";
      limite = LIMITE_VIDEO;
      tiposPermitidos = TIPOS_VIDEO_PERMITIDOS;
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

    const extensao = obterExtensao(arquivo.name);
    const nomeFinal = `${usuarioUuid}/${Date.now()}-${crypto.randomUUID()}.${extensao}`;

    const arrayBuffer = await arquivo.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

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
