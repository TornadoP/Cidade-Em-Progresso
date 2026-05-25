"use client";

import { useState } from "react";

export default function BotaoVotar({ fonteId }: { fonteId: string }) {
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);

  function obterUsuarioId() {
    const chave = "cidade_progresso_usuario_id";
    const usuarioExistente = localStorage.getItem(chave);

    if (usuarioExistente) {
      return usuarioExistente;
    }

    const novoUsuario = crypto.randomUUID();
    localStorage.setItem(chave, novoUsuario);

    return novoUsuario;
  }

  async function votar() {
    setCarregando(true);
    setMensagem("");

    const usuarioId = obterUsuarioId();

    const resposta = await fetch("/api/votos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fonte_id: fonteId,
        usuario_id: usuarioId,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setMensagem(dados.erro || "Erro ao votar.");
      setCarregando(false);
      return;
    }

    setMensagem(dados.mensagem || "Voto registrado com sucesso!");
    setCarregando(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={votar}
        disabled={carregando}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
      >
        {carregando ? "Registrando..." : "Votar nesta obra"}
      </button>

      {mensagem && (
        <p className="text-sm font-medium text-white/90">{mensagem}</p>
      )}
    </div>
  );
}
