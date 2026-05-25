"use client";

import { useState } from "react";

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
      setMensagem("Você precisa entrar ou se cadastrar para votar.");
      setCarregando(false);
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
      setMensagem(dados.erro || "Erro ao votar.");
      setCarregando(false);
      return;
    }

    setMensagem(dados.mensagem || "Voto registrado com sucesso!");
    setVotosAtuais((valorAtual) => valorAtual + 1);
    setCarregando(false);
  }

  return (
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
          Obra concluída
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
  );
}
