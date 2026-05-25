"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  const [mostrarModalErro, setMostrarModalErro] = useState(false);
  const [mensagemErroModal, setMensagemErroModal] = useState("");

  const router = useRouter();

  const statusCores = corStatus(status);
  const obraConcluida = status === "Concluída" || progresso === "100%";

  function obterUsuarioUuid() {
    return localStorage.getItem("cidade_progresso_usuario_uuid");
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

    const resposta = await fetch("/api/votos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fonte_id: fonteId,
        usuario_uuid: usuarioUuid,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
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
      <div className="mt-4 flex flex-wrap items-start gap-3">
        <div className="flex min-w-[180px] flex-col gap-2">
          <span
            className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusCores.fundo} ${statusCores.texto}`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${statusCores.bolinha}`}
            ></span>
            {status}
          </span>

          <p className="text-sm font-medium text-white/90">
            🗳️ {votosAtuais} voto{votosAtuais === 1 ? "" : "s"}
          </p>

          {mensagem && (
            <p className="max-w-[240px] text-sm font-medium text-white/90">
              {mensagem}
            </p>
          )}
        </div>

        {obraConcluida ? (
          <div className="inline-flex items-center justify-center rounded-2xl bg-green-100 px-6 py-3 text-base font-bold text-green-800 shadow-md">
            ✅ Obra concluída
          </div>
        ) : (
          <button
            type="button"
            onClick={votar}
            disabled={carregando}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {carregando ? "Registrando..." : "Votar nesta obra"}
          </button>
        )}
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
