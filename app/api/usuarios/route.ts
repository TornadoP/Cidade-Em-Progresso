import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/app/lib/supabaseAdmin";

function limparCPF(cpf: string) {
  return cpf.replace(/\D/g, "");
}

function limparTelefone(telefone: string) {
  return telefone.replace(/\D/g, "");
}

function validarCPF(cpfRecebido: string) {
  const cpf = limparCPF(cpfRecebido);

  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;

  for (let i = 0; i < 9; i++) {
    soma += Number(cpf[i]) * (10 - i);
  }

  let primeiroDigito = 11 - (soma % 11);
  if (primeiroDigito >= 10) primeiroDigito = 0;

  if (primeiroDigito !== Number(cpf[9])) return false;

  soma = 0;

  for (let i = 0; i < 10; i++) {
    soma += Number(cpf[i]) * (11 - i);
  }

  let segundoDigito = 11 - (soma % 11);
  if (segundoDigito >= 10) segundoDigito = 0;

  return segundoDigito === Number(cpf[10]);
}

function gerarHashCPF(cpf: string) {
  const segredo = process.env.CPF_HASH_SECRET;

  if (!segredo) {
    throw new Error("CPF_HASH_SECRET não foi configurada.");
  }

  return crypto
    .createHmac("sha256", segredo)
    .update(limparCPF(cpf))
    .digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const modo = String(body.modo || "").trim();
    const nome = String(body.nome || "").trim();
    const telefone = limparTelefone(String(body.telefone || ""));
    const cpf = String(body.cpf || "").trim();

    if (!modo || !telefone || !cpf) {
      return NextResponse.json(
        { erro: "Telefone e CPF são obrigatórios." },
        { status: 400 },
      );
    }

    if (telefone.length < 10 || telefone.length > 11) {
      return NextResponse.json(
        { erro: "Informe um telefone válido com DDD." },
        { status: 400 },
      );
    }

    if (!validarCPF(cpf)) {
      return NextResponse.json({ erro: "CPF inválido." }, { status: 400 });
    }

    const cpfHash = gerarHashCPF(cpf);

    if (modo === "login") {
      const { data: usuario, error } = await supabaseAdmin
        .from("usuarios")
        .select("id, nome, telefone")
        .eq("telefone", telefone)
        .eq("cpf_hash", cpfHash)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ erro: error.message }, { status: 500 });
      }

      if (!usuario) {
        return NextResponse.json(
          { erro: "Usuário não encontrado. Confira telefone e CPF." },
          { status: 404 },
        );
      }

      return NextResponse.json({
        mensagem: "Login realizado com sucesso.",
        usuario,
      });
    }

    if (modo === "cadastro") {
      if (!nome || nome.length < 3) {
        return NextResponse.json(
          { erro: "Informe um nome válido." },
          { status: 400 },
        );
      }

      const { data: usuarioPorTelefone } = await supabaseAdmin
        .from("usuarios")
        .select("id, nome, telefone")
        .eq("telefone", telefone)
        .maybeSingle();

      if (usuarioPorTelefone) {
        return NextResponse.json(
          { erro: "Este telefone já está cadastrado. Use a opção Entrar." },
          { status: 409 },
        );
      }

      const { data: usuarioPorCPF } = await supabaseAdmin
        .from("usuarios")
        .select("id, nome, telefone")
        .eq("cpf_hash", cpfHash)
        .maybeSingle();

      if (usuarioPorCPF) {
        return NextResponse.json(
          { erro: "Este CPF já está vinculado a outro cadastro." },
          { status: 409 },
        );
      }

      const { data: usuarioCriado, error: erroCriacao } = await supabaseAdmin
        .from("usuarios")
        .insert({
          nome,
          telefone,
          cpf_hash: cpfHash,
        })
        .select("id, nome, telefone")
        .single();

      if (erroCriacao) {
        return NextResponse.json(
          { erro: erroCriacao.message },
          { status: 500 },
        );
      }

      return NextResponse.json({
        mensagem: "Cadastro criado com sucesso.",
        usuario: usuarioCriado,
      });
    }

    return NextResponse.json(
      { erro: "Modo inválido. Use login ou cadastro." },
      { status: 400 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { erro: "Erro inesperado ao processar usuário." },
      { status: 500 },
    );
  }
}
