"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function RedefinirSenhaPage() {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function atualizarSenha(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setCarregando(true);

    if (!novaSenha || !confirmarSenha) {
      setErro("Preencha a nova senha e a confirmação.");
      setCarregando(false);
      return;
    }

    if (novaSenha.length < 6) {
      setErro("A nova senha precisa ter pelo menos 6 caracteres.");
      setCarregando(false);
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      setCarregando(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (error) {
      setErro(
        "Não foi possível atualizar a senha. Abra novamente o link enviado por email.",
      );
      setCarregando(false);
      return;
    }

    await supabase.auth.signOut();

    localStorage.removeItem("cidade_progresso_usuario_uuid");
    localStorage.removeItem("cidade_progresso_usuario_nome");

    setMensagem("Senha atualizada com sucesso. Faça login novamente.");
    setNovaSenha("");
    setConfirmarSenha("");
    setCarregando(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="w-full max-w-md rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <header className="mb-6">
          <Link
            href="/rotas/login"
            className="text-sm font-semibold text-[#425C59] hover:underline"
          >
            ← Voltar para o login
          </Link>

          <h1 className="mt-5 text-2xl font-bold text-black">
            Redefinir senha
          </h1>

          <p className="mt-2 text-sm leading-6 text-black/70">
            Informe uma nova senha para acessar sua conta.
          </p>
        </header>

        <form onSubmit={atualizarSenha} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-semibold text-black">
              Nova senha
            </label>

            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(event) => setNovaSenha(event.target.value)}
                placeholder="Digite a nova senha"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 pr-14 text-sm text-black outline-none transition focus:border-[#425C59]"
              />

              <button
                type="button"
                onClick={() => setMostrarSenha((valorAtual) => !valorAtual)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl px-2 py-1 text-sm font-semibold text-[#425C59] transition hover:bg-[#E3F1F1]"
              >
                {mostrarSenha ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-black">
              Confirmar nova senha
            </label>

            <input
              type={mostrarSenha ? "text" : "password"}
              value={confirmarSenha}
              onChange={(event) => setConfirmarSenha(event.target.value)}
              placeholder="Repita a nova senha"
              className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
            />
          </div>

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
            {carregando ? "Atualizando..." : "Atualizar senha"}
          </button>
        </form>
      </main>
    </div>
  );
}
