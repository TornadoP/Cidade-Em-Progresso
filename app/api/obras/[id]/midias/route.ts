import { NextRequest, NextResponse } from "next/server";
import { exigirAdmin, exigirUsuarioAutenticado } from "@/app/lib/apiAuth";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BUCKET = "obras-midias";

const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp"];
const TIPOS_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

function extensaoArquivo(nome: string) {
  return nome.split(".").pop()?.toLowerCase() || "bin";
}

function limparNomeArquivo(nome: string) {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-");
}

async function usuarioPodeEditarObra({
  obraId,
  usuarioUuid,
  usuarioEhAdmin,
}: {
  obraId: string;
  usuarioUuid: string;
  usuarioEhAdmin: boolean;
}) {
  const { data: obra, error: erroObra } = await supabaseAdmin
    .from("obras")
    .select("id, origem, sugestao_id")
    .eq("id", obraId)
    .single();

  if (erroObra || !obra) {
    return {
      podeEditar: false,
      erro: "Obra não encontrada.",
      status: 404,
    };
  }

  if (usuarioEhAdmin) {
    return {
      podeEditar: true,
      obra,
    };
  }

  if (obra.origem === "Oficial") {
    return {
      podeEditar: false,
      erro: "Apenas administradores podem alterar mídia de obras oficiais.",
      status: 403,
    };
  }

  if (!obra.sugestao_id) {
    return {
      podeEditar: false,
      erro: "Esta obra não está vinculada a uma sugestão popular.",
      status: 403,
    };
  }

  const { data: sugestao, error: erroSugestao } = await supabaseAdmin
    .from("sugestoes")
    .select("id, usuario_uuid")
    .eq("id", obra.sugestao_id)
    .single();

  if (erroSugestao || !sugestao) {
    return {
      podeEditar: false,
      erro: "Sugestão vinculada não encontrada.",
      status: 404,
    };
  }

  if (sugestao.usuario_uuid !== usuarioUuid) {
    return {
      podeEditar: false,
      erro: "Você só pode alterar mídias de obras criadas por você.",
      status: 403,
    };
  }

  return {
    podeEditar: true,
    obra,
  };
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await exigirUsuarioAutenticado(request);

  if (auth.resposta) {
    return auth.resposta;
  }

  const authAdmin = await exigirAdmin(request);
  const usuarioEhAdmin = !authAdmin.resposta;
  const { id: obraId } = await context.params;

  const permissao = await usuarioPodeEditarObra({
    obraId,
    usuarioUuid: auth.usuario.id,
    usuarioEhAdmin,
  });

  if (!permissao.podeEditar) {
    return NextResponse.json(
      { erro: permissao.erro },
      { status: permissao.status || 403 },
    );
  }

  const formData = await request.formData();
  const arquivo = formData.get("arquivo");
  const tornarPrincipal =
    String(formData.get("tornarPrincipal") || "false") === "true";

  if (!(arquivo instanceof File)) {
    return NextResponse.json(
      { erro: "Nenhum arquivo enviado." },
      { status: 400 },
    );
  }

  const ehImagem = TIPOS_IMAGEM.includes(arquivo.type);
  const ehVideo = TIPOS_VIDEO.includes(arquivo.type);

  if (!ehImagem && !ehVideo) {
    return NextResponse.json(
      {
        erro: "Formato inválido. Envie imagem JPG, PNG, WEBP ou vídeo MP4, WEBM, MOV.",
      },
      { status: 400 },
    );
  }

  const limite = ehImagem ? 5 * 1024 * 1024 : 50 * 1024 * 1024;

  if (arquivo.size > limite) {
    return NextResponse.json(
      {
        erro: ehImagem
          ? "Imagem muito grande. Limite de 5 MB."
          : "Vídeo muito grande. Limite de 50 MB.",
      },
      { status: 400 },
    );
  }

  const extensao = extensaoArquivo(arquivo.name);
  const nomeLimpo = limparNomeArquivo(arquivo.name);
  const nomeFinal = nomeLimpo || `arquivo.${extensao}`;
  const caminho = `obras/${obraId}/${auth.usuario.id}/${Date.now()}-${nomeFinal}`;

  const arrayBuffer = await arquivo.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: erroUpload } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(caminho, buffer, {
      contentType: arquivo.type,
      upsert: false,
    });

  if (erroUpload) {
    return NextResponse.json({ erro: erroUpload.message }, { status: 500 });
  }

  const { data: publicUrl } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(caminho);

  const url = publicUrl.publicUrl;

  if (tornarPrincipal && ehImagem) {
    await supabaseAdmin
      .from("obras_imagens")
      .update({ eh_principal: false })
      .eq("obra_id", obraId);

    await supabaseAdmin
      .from("obras")
      .update({
        imagem: url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", obraId);
  }

  const { error: erroInsert } = await supabaseAdmin
    .from("obras_imagens")
    .insert({
      obra_id: obraId,
      url,
      legenda: ehImagem
        ? "Imagem enviada pelo autor"
        : "Vídeo enviado pelo autor",
      ordem: 0,
      tipo: ehImagem ? "imagem" : "video",
      origem: usuarioEhAdmin ? "admin" : "criador",
      usuario_uuid: auth.usuario.id,
      eh_principal: tornarPrincipal && ehImagem,
    });

  if (erroInsert) {
    return NextResponse.json(
      { erro: "Arquivo enviado, mas não foi possível salvar na galeria." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    mensagem: "Mídia enviada com sucesso.",
    url,
    tipo: ehImagem ? "imagem" : "video",
    imagem_principal_atualizada: tornarPrincipal && ehImagem,
  });
}
