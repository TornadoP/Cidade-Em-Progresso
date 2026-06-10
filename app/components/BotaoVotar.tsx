"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabaseClient";

function corStatus(status: string) {
  if (status === "Concluída") {
    return {
      fundo: "bg-green-100",
      texto: "text-green-800",
      bolinha: "bg-green-500",
    };
  }

  if (status === "Em andamento") {
    return {
      fundo: "bg-yellow-100",
      texto: "text-yellow-800",
      bolinha: "bg-yellow-500",
    };
  }

  if (status === "Em planejamento") {
    return {
      fundo: "bg-blue-100",
      texto: "text-blue-800",
      bolinha: "bg-blue-500",
    };
  }

  return {
    fundo: "bg-zinc-100",
    texto: "text-zinc-800",
    bolinha: "bg-zinc-500",
  };
}

export default function BotaoVotar({
  fonteId,
  status,
  totalVotos,
  progresso,
}: {
  fonteId: string;
  status: string;
  totalVotos: number;
  progresso: string;
}) {
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [votosAtuais, setVotosAtuais] = useState(totalVotos);
  const [mostrarModalLogin, setMostrarModalLogin] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [mostrarModalErro, setMostrarModalErro] = useState(false);
  const [mensagemErroModal, setMensagemErroModal] = useState("");

  const router = useRouter();

  const statusCores = corStatus(status);
  const obraConcluida = status === "Concluída" || progresso === "100%";

  function obterUsuarioUuid() {
    return localStorage.getItem("cidade_progresso_usuario_uuid");
  }

  function abrirConfirmacaoDeVoto() {
    const usuarioUuid = obterUsuarioUuid();

    if (!usuarioUuid) {
      setMostrarModalLogin(true);
      return;
    }

    setMostrarConfirmacao(true);
  }

  async function confirmarVoto() {
    setMostrarConfirmacao(false);
    await votar();
  }

  async function votar() {
    setCarregando(true);
    setMensagem("");

    const usuarioUuid = obterUsuarioUuid();

    if (!usuarioUuid) {
      setCarregando(false);
      setMostrarModalLogin(true);
      return;
    }

    const { data: sessao } = await supabase.auth.getSession();
    const token = sessao.session?.access_token;

    if (!token) {
      localStorage.removeItem("cidade_progresso_usuario_uuid");
      localStorage.removeItem("cidade_progresso_usuario_nome");
      setCarregando(false);
      setMostrarModalLogin(true);
      return;
    }

    const resposta = await fetch("/api/votos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        fonte_id: fonteId,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      if (resposta.status === 401) {
        localStorage.removeItem("cidade_progresso_usuario_uuid");
        localStorage.removeItem("cidade_progresso_usuario_nome");
      }

      setMensagemErroModal(dados.erro || "Erro ao votar.");
      setMostrarModalErro(true);
      setCarregando(false);
      return;
    }

    setMensagem(dados.mensagem || "Voto registrado com sucesso!");
    setVotosAtuais((valorAtual) => valorAtual + 1);
    setCarregando(false);
  }

  return (
    <>
      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex h-11 min-w-[180px] items-center justify-center gap-2 rounded-full px-5 text-sm font-bold ${statusCores.fundo} ${statusCores.texto}`}
          >
            <span
              className={`h-3 w-3 rounded-full ${statusCores.bolinha}`}
            ></span>
            {status}
          </span>

          <span className="inline-flex h-11 min-w-[120px] items-center justify-center rounded-full bg-white/15 px-5 text-sm font-bold text-white ring-1 ring-white/20">
            🗳️ {votosAtuais} voto{votosAtuais === 1 ? "" : "s"}
          </span>

          {mensagem && (
            <p className="basis-full text-sm font-medium text-white/90">
              {mensagem}
            </p>
          )}
        </div>

        <div className="flex w-full lg:w-auto lg:justify-end">
          {obraConcluida ? (
            <div className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-green-100 px-8 text-base font-black text-green-800 shadow-lg lg:w-auto">
              ✅ Obra concluída
            </div>
          ) : (
            <button
              type="button"
              onClick={abrirConfirmacaoDeVoto}
              disabled={carregando}
              className="h-14 w-full rounded-2xl bg-blue-600 px-8 text-base font-black text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto"
            >
              {carregando ? "Registrando..." : "Votar nesta obra"}
            </button>
          )}
        </div>
      </div>

      {mostrarModalLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-black shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3F1F1] text-2xl">
              🗳️
            </div>

            <h2 className="text-2xl font-bold">Entre para votar</h2>

            <p className="mt-3 text-sm leading-6 text-black/70">
              Para registrar seu voto e garantir que cada cidadão tenha até 5
              votos ativos, você precisa entrar ou se cadastrar no protótipo.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => router.push("/rotas/login")}
                className="flex-1 rounded-2xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#334846]"
              >
                Entrar / Cadastrar
              </button>

              <button
                type="button"
                onClick={() => setMostrarModalLogin(false)}
                className="flex-1 rounded-2xl border border-black/20 px-4 py-3 text-sm font-bold text-black transition hover:bg-black/5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarConfirmacao && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E3F1F1] text-2xl">
                👍
              </div>

              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#425C59]">
                  Confirmar voto
                </p>

                <h2 className="text-xl font-bold text-black">Tem certeza?</h2>
              </div>
            </div>

            <p className="text-sm leading-7 text-black/70">
              Você está prestes a usar 1 dos seus votos ativos nesta obra. Esse
              voto ficará registrado no seu perfil e ajudará a destacar essa
              prioridade.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setMostrarConfirmacao(false)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-bold text-black transition hover:bg-zinc-100"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={confirmarVoto}
                className="w-full rounded-xl bg-[#FFC222] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#eab308]"
              >
                Sim, confirmar voto
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarModalErro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 text-black shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-2xl">
              ⚠️
            </div>

            <h2 className="text-2xl font-bold">Não foi possível votar</h2>

            <p className="mt-3 text-sm leading-6 text-black/70">
              {mensagemErroModal}
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setMostrarModalErro(false)}
                className="flex-1 rounded-2xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#334846]"
              >
                Entendi
              </button>

              <button
                type="button"
                onClick={() => router.push("/rotas/ranking")}
                className="flex-1 rounded-2xl border border-black/20 px-4 py-3 text-sm font-bold text-black transition hover:bg-black/5"
              >
                Ver ranking
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
