"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

export default function BotaoProcessarDocumentos() {
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function processarDocumentos() {
    const confirmar = window.confirm(
      "Deseja processar os PDFs das obras com OCR? Esse processo pode demorar.",
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
        return;
      }

      const resposta = await fetch("/api/admin/processar-documentos-obras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          limite: 1,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao processar documentos.");
        return;
      }

      setMensagem(
        `Processamento concluído. Documentos processados: ${
          dados.processados || 0
        }.`,
      );
    } catch {
      setErro("Erro inesperado ao processar documentos.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
      <h2 className="text-xl font-bold text-black">
        Processar documentos das obras
      </h2>

      <p className="mt-2 text-sm leading-6 text-black/70">
        Usa OCR nos PDFs importados para identificar nota de empenho, processo
        de despesa, medição e relatório fotográfico.
      </p>

      <button
        type="button"
        onClick={processarDocumentos}
        disabled={carregando}
        className="mt-4 rounded-2xl bg-[#425C59] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {carregando ? "Processando documentos..." : "Processar documentos"}
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
