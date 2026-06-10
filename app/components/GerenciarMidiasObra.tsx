"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type GerenciarMidiasObraProps = {
  obraId: string;
};

export default function GerenciarMidiasObra({
  obraId,
}: GerenciarMidiasObraProps) {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [tornarPrincipal, setTornarPrincipal] = useState(false);
  const [verificandoPermissao, setVerificandoPermissao] = useState(true);
  const [podeEditar, setPodeEditar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const verificarPermissao = useCallback(async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setPodeEditar(false);
        return;
      }

      const resposta = await fetch(`/api/obras/${obraId}/midias`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!resposta.ok) {
        setPodeEditar(false);
        return;
      }

      const dados = await resposta.json();

      setPodeEditar(Boolean(dados.podeEditar));
    } catch {
      setPodeEditar(false);
    } finally {
      setVerificandoPermissao(false);
    }
  }, [obraId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void verificarPermissao();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [verificarPermissao]);

  async function enviarMidia() {
    if (!arquivo) {
      setErro("Selecione uma imagem ou vídeo.");
      return;
    }

    setCarregando(true);
    setMensagem("");
    setErro("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        setErro("Faça login para enviar mídia.");
        return;
      }

      const formData = new FormData();
      formData.append("arquivo", arquivo);
      formData.append("tornarPrincipal", String(tornarPrincipal));

      const resposta = await fetch(`/api/obras/${obraId}/midias`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao enviar mídia.");
        return;
      }

      setMensagem("Mídia enviada com sucesso.");
      setArquivo(null);
      setTornarPrincipal(false);

      window.location.reload();
    } catch {
      setErro("Erro inesperado ao enviar mídia.");
    } finally {
      setCarregando(false);
    }
  }

  if (verificandoPermissao) {
    return null;
  }

  if (!podeEditar) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5">
      <h2 className="text-lg font-black text-black">
        Gerenciar imagens e vídeos da sua sugestão
      </h2>

      <p className="mt-2 text-sm leading-6 text-black/70">
        Como você criou esta sugestão, pode adicionar imagens e vídeos à
        galeria. Imagens também podem ser definidas como imagem principal da
        obra.
      </p>

      <div className="mt-5 space-y-4">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={(evento) => {
            const arquivoSelecionado = evento.target.files?.[0] || null;

            setArquivo(arquivoSelecionado);

            if (!arquivoSelecionado?.type.startsWith("image/")) {
              setTornarPrincipal(false);
            }
          }}
          className="block w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black"
        />

        <label className="flex items-center gap-3 text-sm font-bold text-black">
          <input
            type="checkbox"
            checked={tornarPrincipal}
            onChange={(evento) => setTornarPrincipal(evento.target.checked)}
            disabled={arquivo ? !arquivo.type.startsWith("image/") : true}
            className="h-4 w-4"
          />
          Usar esta imagem como imagem principal
        </label>

        <button
          type="button"
          onClick={enviarMidia}
          disabled={carregando || !arquivo}
          className="rounded-2xl bg-[#425C59] px-6 py-3 text-sm font-black text-white transition hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando ? "Enviando..." : "Enviar mídia"}
        </button>

        {mensagem && (
          <div className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-700">
            {mensagem}
          </div>
        )}

        {erro && (
          <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700">
            {erro}
          </div>
        )}
      </div>
    </section>
  );
}
