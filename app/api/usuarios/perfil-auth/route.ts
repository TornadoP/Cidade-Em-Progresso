import { NextResponse } from "next/server";
import crypto from "crypto";
import { exigirUsuarioAutenticado } from "@/app/lib/apiAuth";
import { aplicarRateLimit, obterIpCliente } from "@/app/lib/rateLimit";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

function limparCpf(cpf: string) {
  return cpf.replace(/\D/g, "");
}

function validarCpf(cpfOriginal: string) {
  const cpf = limparCpf(cpfOriginal);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i += 1) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let digito1 = 11 - (soma % 11);
  if (digito1 >= 10) digito1 = 0;

  if (digito1 !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i += 1) {
    soma += Number(cpf[i]) * (11 - i);
  }

  let digito2 = 11 - (soma % 11);
  if (digito2 >= 10) digito2 = 0;

  return digito2 === Number(cpf[10]);
}

function gerarHashCpf(cpf: string) {
  const segredo = process.env.CPF_HASH_SECRET;

  if (!segredo) {
    throw new Error("CPF_HASH_SECRET não configurado.");
  }

  return crypto
    .createHmac("sha256", segredo)
    .update(limparCpf(cpf))
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const limite = await aplicarRateLimit({
      chave: obterIpCliente(request),
      rota: "/api/usuarios/perfil-auth",
      limite: 10,
      janelaSegundos: 60 * 60,
    });

    if (limite) {
      return limite;
    }

    const auth = await exigirUsuarioAutenticado(request);

    if (auth.resposta) {
      return auth.resposta;
    }

    const body = await request.json();

    const authUserId = String(body.auth_user_id || "").trim();
    const nome = String(body.nome || "").trim();
    const telefone = String(body.telefone || "").trim();
    const cpf = String(body.cpf || "").trim();
    const email = String(body.email || "")
      .trim()
      .toLowerCase();

    if (!authUserId || !nome || !telefone || !cpf || !email) {
      return NextResponse.json(
        { erro: "Preencha todos os campos obrigatórios." },
        { status: 400 },
      );
    }

    if (auth.usuario.id !== authUserId) {
      return NextResponse.json(
        { erro: "Usuário autenticado não confere com o perfil." },
        { status: 403 },
      );
    }

    if (!validarCpf(cpf)) {
      return NextResponse.json({ erro: "CPF inválido." }, { status: 400 });
    }

    const cpfHash = gerarHashCpf(cpf);

    const { data: cpfExistente } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("cpf_hash", cpfHash)
      .maybeSingle();

    if (cpfExistente && cpfExistente.id !== authUserId) {
      return NextResponse.json(
        { erro: "Este CPF já está cadastrado." },
        { status: 409 },
      );
    }

    const { data: telefoneExistente } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("telefone", telefone)
      .maybeSingle();

    if (telefoneExistente && telefoneExistente.id !== authUserId) {
      return NextResponse.json(
        { erro: "Este telefone já está cadastrado." },
        { status: 409 },
      );
    }

    const { error } = await supabaseAdmin.from("usuarios").upsert({
      id: authUserId,
      nome,
      telefone,
      cpf_hash: cpfHash,
      email,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({
      mensagem: "Perfil criado com sucesso.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Erro inesperado ao criar perfil." },
      { status: 500 },
    );
  }
}
