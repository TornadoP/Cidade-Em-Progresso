"use client";

import type { FormEvent } from "react";
import { useState } from "react";

type Obra = {
  id: string;
  titulo: string;
  fonte_id: string | null;
  origem: string | null;
  tipo: string | null;
  status: string | null;
};

type Props = {
  obras: Obra[];
};

export default function FormUploadImagemObra({ obras }: Props) {
  const [obraId, setObraId] = useState("");
  const [legenda, setLegenda] = useState("");
  const [ordem, setOrdem] = useState("1");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [chave, setChave] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function enviarImagem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagem("");
    setErro("");

    if (!obraId) {
      setErro("Selecione uma obra.");
      return;
    }

    if (!arquivo) {
      setErro("Selecione uma imagem.");
      return;
    }

    if (!chave) {
      setErro("Informe a chave de upload.");
      return;
    }

    try {
      setEnviando(true);

      const formData = new FormData();
      formData.append("obra_id", obraId);
      formData.append("legenda", legenda);
      formData.append("ordem", ordem);
      formData.append("arquivo", arquivo);

      const resposta = await fetch("/api/obras/imagens", {
        method: "POST",
        headers: {
          "x-upload-secret": chave,
        },
        body: formData,
      });

      const json = await resposta.json();

      if (!resposta.ok) {
        throw new Error(json.erro || "Erro ao enviar imagem.");
      }

      setMensagem("Imagem enviada com sucesso.");
      setLegenda("");
      setOrdem("1");
      setArquivo(null);

      const inputArquivo = document.getElementById(
        "arquivo-obra",
      ) as HTMLInputElement | null;

      if (inputArquivo) {
        inputArquivo.value = "";
      }
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao enviar imagem.",
      );
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={enviarImagem} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-bold text-black">Obra</label>

        <select
          value={obraId}
          onChange={(event) => setObraId(event.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#425C59]"
        >
          <option value="">Selecione uma obra</option>

          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>
              {obra.titulo} - {obra.tipo || "Sem tipo"} -{" "}
              {obra.status || "Sem status"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-black">
          Legenda da foto
        </label>

        <input
          type="text"
          value={legenda}
          onChange={(event) => setLegenda(event.target.value)}
          placeholder="Ex: Fachada da escola em reforma"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#425C59]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-black">Ordem</label>

        <input
          type="number"
          min="0"
          value={ordem}
          onChange={(event) => setOrdem(event.target.value)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#425C59]"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-black">
          Imagem
        </label>

        <input
          id="arquivo-obra"
          type="file"
          accept="image/*"
          onChange={(event) => setArquivo(event.target.files?.[0] || null)}
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#425C59]"
        />

        <p className="mt-2 text-xs text-black/50">
          Recomendado: imagem horizontal, ate 5 MB.
        </p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-bold text-black">
          Chave de upload
        </label>

        <input
          type="password"
          value={chave}
          onChange={(event) => setChave(event.target.value)}
          placeholder="Digite a UPLOAD_SECRET"
          className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#425C59]"
        />

        <p className="mt-2 text-xs text-black/50">
          Use a mesma chave cadastrada na variavel UPLOAD_SECRET da Vercel.
        </p>
      </div>

      {erro && (
        <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {erro}
        </div>
      )}

      {mensagem && (
        <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {mensagem}
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-2xl bg-[#425C59] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#314744] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {enviando ? "Enviando..." : "Enviar imagem"}
      </button>
    </form>
  );
}
