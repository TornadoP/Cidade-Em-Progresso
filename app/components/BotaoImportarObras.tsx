"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function BotaoImportarObras() {
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function importarObras() {
    const confirmar = window.confirm(
      "Deseja atualizar/importar as obras oficiais da Prefeitura de Pedreiras?",
    );

    if (!confirmar) return;

    setCarregando(true);
    setMensagem("");
    setErro("");

    try {
      const { data: sessao } = await supabase.auth.getSession();
      const token = sessao.session?.access_token;

      if (!token) {
        setErro("Sua sessão expirou. Faça login novamente.");
        setCarregando(false);
        return;
      }

      const resposta = await fetch("/api/obras/importar-pedreiras", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Não foi possível importar as obras.");
        setCarregando(false);
        return;
      }

      setMensagem(
        `Importação concluída. Obras salvas: ${
          dados.salvas || 0
        }. Documentos: ${dados.documentos_oficiais || 0}. Imagens: ${
          dados.imagens_oficiais || 0
        }.`,
      );
    } catch {
      setErro("Erro inesperado ao importar obras.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-black">
          Atualizar obras oficiais
        </h2>

        <p className="mt-2 text-sm leading-6 text-black/70">
          Busca novamente as obras da Prefeitura de Pedreiras, atualiza dados
          oficiais e tenta importar imagens e PDFs encontrados nas páginas das
          obras.
        </p>
      </div>

      <button
        type="button"
        onClick={importarObras}
        disabled={carregando}
        className="rounded-2xl bg-[#425C59] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {carregando ? "Atualizando obras..." : "Atualizar importação"}
      </button>

      {mensagem && (
        <div className="mt-4 rounded-2xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-700">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
          {erro}
        </div>
      )}
    </div>
  );
}
