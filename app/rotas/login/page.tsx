"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

function formatarTelefone(valor: string) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .slice(0, 15);
}

function formatarCPF(valor: string) {
  return valor
    .replace(/\D/g, "")
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2")
    .slice(0, 14);
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const voltarPara = searchParams.get("voltar") || "/rotas/obras";

  const [aba, setAba] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");

  async function enviarEmailRecuperacao() {
    setErro("");
    setMensagem("");
    setCarregando(true);

    const emailLimpo = emailRecuperacao.trim().toLowerCase();

    if (!emailLimpo) {
      setErro("Informe seu email para recuperar a senha.");
      setCarregando(false);
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(emailLimpo, {
      redirectTo: `${window.location.origin}/rotas/redefinir-senha`,
    });

    if (error) {
      setErro("Não foi possível enviar o email de recuperação.");
      setCarregando(false);
      return;
    }

    setMensagem("Enviamos um link de recuperação para seu email.");
    setCarregando(false);
  }

  async function enviarFormulario(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");
    setCarregando(true);

    const emailLimpo = email.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!emailLimpo || !senhaLimpa) {
      setErro("Informe email e senha.");
      setCarregando(false);
      return;
    }

    if (senhaLimpa.length < 6) {
      setErro("A senha precisa ter pelo menos 6 caracteres.");
      setCarregando(false);
      return;
    }

    try {
      if (aba === "cadastro") {
        if (!nome.trim() || !telefone.trim() || !cpf.trim()) {
          setErro("Preencha nome, telefone e CPF para criar a conta.");
          setCarregando(false);
          return;
        }

        const { data: cadastroAuth, error: erroAuth } =
          await supabase.auth.signUp({
            email: emailLimpo,
            password: senhaLimpa,
          });

        if (erroAuth || !cadastroAuth.user) {
          setErro(
            erroAuth?.message ||
              "Não foi possível criar a conta no Supabase Auth.",
          );
          setCarregando(false);
          return;
        }

        const authUserId = cadastroAuth.user.id;
        const tokenCadastro =
          cadastroAuth.session?.access_token ||
          (await supabase.auth.getSession()).data.session?.access_token;

        if (!tokenCadastro) {
          setErro(
            "Conta criada, mas a sessão não foi confirmada para salvar o perfil.",
          );
          setCarregando(false);
          return;
        }

        const respostaPerfil = await fetch("/api/usuarios/perfil-auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenCadastro}`,
          },
          body: JSON.stringify({
            auth_user_id: authUserId,
            nome,
            telefone,
            cpf,
            email: emailLimpo,
          }),
        });

        const dadosPerfil = await respostaPerfil.json();

        if (!respostaPerfil.ok) {
          setErro(
            dadosPerfil.erro ||
              "Conta criada, mas não foi possível salvar o perfil.",
          );
          setCarregando(false);
          return;
        }

        localStorage.setItem("cidade_progresso_usuario_uuid", authUserId);
        localStorage.setItem(
          "cidade_progresso_usuario_nome",
          nome.trim() || "Cidadão",
        );

        setMensagem(
          "Conta criada com sucesso. Você já pode usar sua participação no protótipo.",
        );

        setTimeout(() => {
          router.push(voltarPara);
        }, 700);

        return;
      }

      const { data: loginAuth, error: erroAuth } =
        await supabase.auth.signInWithPassword({
          email: emailLimpo,
          password: senhaLimpa,
        });

      if (erroAuth || !loginAuth.user) {
        setErro("Email ou senha inválidos.");
        setCarregando(false);
        return;
      }

      const usuarioUuid = loginAuth.user.id;

      const { data: perfil, error: erroPerfil } = await supabase
        .from("usuarios")
        .select("nome")
        .eq("id", usuarioUuid)
        .maybeSingle();

      if (erroPerfil) {
        setErro("Login feito, mas houve erro ao buscar o perfil.");
        setCarregando(false);
        return;
      }

      localStorage.setItem("cidade_progresso_usuario_uuid", usuarioUuid);
      localStorage.setItem(
        "cidade_progresso_usuario_nome",
        perfil?.nome || "Cidadão",
      );

      setMensagem("Login realizado com sucesso.");

      setTimeout(() => {
        router.push(voltarPara);
      }, 700);
    } catch (error) {
      console.error(error);
      setErro("Erro inesperado ao conectar com o servidor.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="w-full max-w-md rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <header className="mb-6">
          <Link
            href="/"
            className="text-sm font-semibold text-[#425C59] hover:underline"
          >
            ← Voltar para o início
          </Link>

          <h1 className="mt-5 text-2xl font-bold text-black">
            Acesso do cidadão
          </h1>

          <p className="mt-2 text-sm leading-6 text-black/70">
            Entre ou crie sua conta para votar em obras e acompanhar sua
            participação.
          </p>
        </header>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-white/60 p-1">
          <button
            type="button"
            onClick={() => {
              setAba("login");
              setErro("");
              setMensagem("");
            }}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              aba === "login"
                ? "bg-[#425C59] text-white shadow"
                : "text-black hover:bg-white"
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => {
              setAba("cadastro");
              setErro("");
              setMensagem("");
            }}
            className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
              aba === "cadastro"
                ? "bg-[#425C59] text-white shadow"
                : "text-black hover:bg-white"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={enviarFormulario} className="space-y-4">
          {aba === "cadastro" && (
            <div>
              <label className="mb-1 block text-sm font-semibold text-black">
                Nome completo
              </label>

              <input
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex: Juan Carlos"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
              />
            </div>
          )}

          {aba === "cadastro" && (
            <>
              <div>
                <label className="mb-1 block text-sm font-semibold text-black">
                  Telefone
                </label>

                <input
                  type="tel"
                  value={telefone}
                  onChange={(event) =>
                    setTelefone(formatarTelefone(event.target.value))
                  }
                  placeholder="(99) 99999-9999"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold text-black">
                  CPF
                </label>

                <input
                  type="text"
                  value={cpf}
                  onChange={(event) => setCpf(formatarCPF(event.target.value))}
                  placeholder="000.000.000-00"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-black">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-black">
              Senha
            </label>

            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                placeholder="Digite sua senha"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-14 text-sm text-black outline-none transition focus:border-[#425C59]"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((valorAtual) => !valorAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-sm font-semibold text-[#425C59] transition hover:bg-[#E3F1F1]"
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {aba === "login" && (
            <button
              type="button"
              onClick={() => {
                setModoRecuperacao((valorAtual) => !valorAtual);
                setEmailRecuperacao(email);
                setErro("");
                setMensagem("");
              }}
              className="text-sm font-semibold text-[#425C59] underline"
            >
              Esqueci minha senha
            </button>
          )}

          {aba === "login" && modoRecuperacao && (
            <div className="rounded-3xl bg-[#E3F1F1] p-5">
              <h2 className="text-lg font-bold text-black">Recuperar senha</h2>

              <p className="mt-2 text-sm leading-6 text-black/70">
                Informe o email cadastrado. Enviaremos um link para você criar
                uma nova senha.
              </p>

              <div className="mt-4 space-y-4">
                <input
                  type="email"
                  value={emailRecuperacao}
                  onChange={(event) => setEmailRecuperacao(event.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                />

                <button
                  type="button"
                  onClick={enviarEmailRecuperacao}
                  disabled={carregando}
                  className="w-full rounded-2xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {carregando ? "Enviando..." : "Enviar link de recuperação"}
                </button>
              </div>
            </div>
          )}

          {erro && (
            <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
              {mensagem}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-2xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {carregando
              ? "Processando..."
              : aba === "login"
                ? "Entrar"
                : "Criar conta"}
          </button>
        </form>

        <div className="mt-5 rounded-2xl bg-white/50 p-4 text-xs leading-5 text-black/70">
          Este acesso é uma simulação para o protótipo. O CPF não é salvo em
          texto puro; apenas uma versão protegida é armazenada.
        </div>
      </main>
    </div>
  );
}
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
          <main className="w-full max-w-md rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <h1 className="text-2xl font-bold text-black">
              Carregando acesso...
            </h1>
          </main>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
