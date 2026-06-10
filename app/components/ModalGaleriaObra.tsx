"use client";

import Image from "next/image";
import { useState } from "react";

type ImagemObra = {
  id: string;
  url: string;
  legenda?: string | null;
  ordem?: number | null;
  tipo?: "imagem" | "video" | string | null;
};

type Props = {
  titulo: string;
  imagemPrincipal?: string | null;
  imagens?: ImagemObra[] | null;
  videoUrl?: string | null;
};

export default function ModalGaleriaObra({
  titulo,
  imagemPrincipal,
  imagens,
  videoUrl,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const [midiaSelecionada, setMidiaSelecionada] = useState<{
    tipo: "imagem" | "video";
    url: string;
    legenda?: string;
  } | null>(null);

  const midiasDisponiveis = imagens || [];
  const imagensDisponiveis = midiasDisponiveis.filter(
    (midia) => midia.tipo !== "video",
  );
  const videosDisponiveis = midiasDisponiveis.filter(
    (midia) => midia.tipo === "video",
  );
  const temImagensReais = imagensDisponiveis.length > 0;
  const temVideo = Boolean(videoUrl) || videosDisponiveis.length > 0;
  const temMidia = temImagensReais || temVideo;

  function abrirImagem(url: string, legenda?: string | null) {
    setMidiaSelecionada({
      tipo: "imagem",
      url,
      legenda: legenda || "Foto da obra",
    });
  }

  function abrirVideo(url: string) {
    setMidiaSelecionada({
      tipo: "video",
      url,
      legenda: "Vídeo da sugestão",
    });
  }

  return (
    <>
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F1] text-[#425C59] shadow-sm ring-1 ring-[#425C59]/10">
            🖼️
          </div>

          <h3 className="text-lg font-bold text-black">Galeria</h3>
        </div>

        {temMidia ? (
          <p className="text-sm leading-7 text-black/70">
            Esta obra possui arquivos enviados para consulta visual. Abra a
            galeria para ver fotos e vídeos relacionados.
          </p>
        ) : (
          <p className="text-sm leading-7 text-black/70">
            Fotos e vídeos reais ainda não foram adicionados para esta obra. Por
            enquanto, a imagem principal representa a categoria da obra.
          </p>
        )}

        <div className="mt-5">
          <button
            type="button"
            onClick={() => setAberto(true)}
            className="inline-flex rounded-xl bg-[#425C59] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#314744]"
          >
            Ver galeria
          </button>
        </div>
      </div>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[88vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#425C59]">
                  Galeria da obra
                </p>

                <h2 className="mt-1 text-2xl font-bold text-black">
                  {titulo}
                </h2>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  Clique em uma foto ou vídeo para visualizar em destaque.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAberto(false);
                  setMidiaSelecionada(null);
                }}
                className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Fechar
              </button>
            </div>

            {midiaSelecionada && (
              <div className="mb-6 rounded-3xl bg-zinc-100 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-black">
                    {midiaSelecionada.legenda}
                  </p>

                  <button
                    type="button"
                    onClick={() => setMidiaSelecionada(null)}
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black shadow-sm"
                  >
                    Fechar visualização
                  </button>
                </div>

                {midiaSelecionada.tipo === "imagem" ? (
                  <div className="relative h-[420px] w-full overflow-hidden rounded-2xl bg-black">
                    <Image
                      src={midiaSelecionada.url}
                      alt={midiaSelecionada.legenda || "Foto da obra"}
                      fill
                      sizes="100vw"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <video
                    src={midiaSelecionada.url}
                    controls
                    preload="metadata"
                    className="max-h-[420px] w-full rounded-2xl bg-black"
                  >
                    Seu navegador não suporta reprodução de vídeo.
                  </video>
                )}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {temImagensReais ? (
                imagensDisponiveis.map((imagem) => (
                  <button
                    key={imagem.id}
                    type="button"
                    onClick={() => abrirImagem(imagem.url, imagem.legenda)}
                    className="group overflow-hidden rounded-2xl bg-[#E3F1F1] text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-44 w-full bg-black/10">
                      <Image
                        src={imagem.url}
                        alt={imagem.legenda || `Foto da obra ${titulo}`}
                        fill
                        sizes="320px"
                        className="object-cover transition group-hover:scale-105"
                      />
                    </div>

                    <div className="p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-black/75">
                        {imagem.legenda || "Foto da obra"}
                      </p>
                    </div>
                  </button>
                ))
              ) : imagemPrincipal ? (
                <button
                  type="button"
                  onClick={() =>
                    abrirImagem(
                      imagemPrincipal,
                      "Imagem principal da categoria da obra",
                    )
                  }
                  className="group overflow-hidden rounded-2xl bg-[#E3F1F1] text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative h-44 w-full bg-black/10">
                    <Image
                      src={imagemPrincipal}
                      alt={`Imagem principal da obra ${titulo}`}
                      fill
                      sizes="320px"
                      className="object-cover transition group-hover:scale-105"
                    />
                  </div>

                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-black/75">
                      Imagem principal da categoria
                    </p>
                  </div>
                </button>
              ) : null}

              {videosDisponiveis.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => abrirVideo(video.url)}
                  className="group overflow-hidden rounded-2xl bg-[#E3F1F1] text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-44 w-full items-center justify-center bg-black text-white">
                    <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-bold">
                      ▶ Vídeo
                    </span>
                  </div>

                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-black/75">
                      {video.legenda || "Vídeo da obra"}
                    </p>
                  </div>
                </button>
              ))}

              {videoUrl && (
                <button
                  type="button"
                  onClick={() => abrirVideo(videoUrl)}
                  className="group overflow-hidden rounded-2xl bg-[#425C59] text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-44 w-full items-center justify-center bg-black/20">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl shadow-lg transition group-hover:scale-110">
                      ▶️
                    </div>
                  </div>

                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold text-white">
                      Vídeo da sugestão
                    </p>
                  </div>
                </button>
              )}

              {!temMidia && !imagemPrincipal && (
                <div className="rounded-2xl bg-[#E3F1F1] p-5 text-sm leading-7 text-black/60">
                  Nenhuma mídia disponível para esta obra.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
