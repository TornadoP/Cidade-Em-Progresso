"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SlideGuia = {
  titulo: string;
  descricao: string;
  imagem: string;
};

const slides: SlideGuia[] = [
  {
    titulo: "Bem-vindo ao Cidade em Progresso",
    descricao:
      "Acompanhe obras públicas, veja o andamento dos serviços e participe das prioridades da cidade.",
    imagem: "/guia/boas-vindas.png",
  },
  {
    titulo: "Veja as obras cadastradas",
    descricao:
      "Encontre obras oficiais e sugestões populares enviadas por cidadãos.",
    imagem: "/guia/obras.png",
  },
  {
    titulo: "Acompanhe os detalhes",
    descricao:
      "Veja localização, status, progresso, descrição, informações públicas e atualizações da obra.",
    imagem: "/guia/detalhes.png",
  },
  {
    titulo: "Vote nas prioridades",
    descricao:
      "Cada cidadão pode ter até 5 votos ativos para apoiar as obras mais importantes.",
    imagem: "/guia/votos.png",
  },
  {
    titulo: "Envie sugestões populares",
    descricao:
      "Sugira melhorias, envie fotos, vídeos e explique problemas da sua região.",
    imagem: "/guia/participar.png",
  },
  {
    titulo: "Acompanhe seu perfil",
    descricao:
      "Veja seus votos ativos, votos restantes, histórico de participação e sugestões enviadas.",
    imagem: "/guia/perfil.png",
  },
  {
    titulo: "Veja fotos e vídeos",
    descricao:
      "Abra a galeria da obra para visualizar fotos e vídeos relacionados.",
    imagem: "/guia/galeria.png",
  },
  {
    titulo: "Acompanhe atualizações",
    descricao:
      "Use o botão de atualizações para acessar o Instagram do projeto.",
    imagem: "/guia/instagram.png",
  },
];

export default function GuiaInicial() {
  const [aberto, setAberto] = useState(false);
  const [indiceAtual, setIndiceAtual] = useState(0);

  const slideAtual = slides[indiceAtual];
  const primeiroSlide = indiceAtual === 0;
  const ultimoSlide = indiceAtual === slides.length - 1;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const guiaJaVisto = localStorage.getItem("cidade_progresso_guia_visto");

      if (!guiaJaVisto) {
        setAberto(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function fecharGuia() {
    localStorage.setItem("cidade_progresso_guia_visto", "true");
    setAberto(false);
  }

  function voltarSlide() {
    if (primeiroSlide) return;
    setIndiceAtual((indice) => indice - 1);
  }

  function avancarSlide() {
    if (ultimoSlide) {
      fecharGuia();
      return;
    }

    setIndiceAtual((indice) => indice + 1);
  }

  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-sm">
      <div className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-black/10 px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#425C59]">
              Guia rápido
            </p>

            <h2 className="mt-1 text-lg font-bold text-black sm:text-xl">
              Como usar o site
            </h2>
          </div>

          <button
            type="button"
            onClick={fecharGuia}
            className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
          >
            Pular
          </button>
        </div>

        <div className="grid flex-1 overflow-y-auto md:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[300px] bg-[#E3F1F1] sm:min-h-[420px] md:min-h-[540px]">
            <Image
              src={slideAtual.imagem}
              alt={slideAtual.titulo}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain"
              preload
            />
          </div>

          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                {slides.map((slide, indice) => (
                  <button
                    key={slide.titulo}
                    type="button"
                    onClick={() => setIndiceAtual(indice)}
                    aria-label={`Ir para o passo ${indice + 1}`}
                    className={`h-2.5 rounded-full transition ${
                      indice === indiceAtual
                        ? "w-8 bg-[#425C59]"
                        : "w-2.5 bg-zinc-300 hover:bg-zinc-400"
                    }`}
                  />
                ))}
              </div>

              <p className="mb-3 text-sm font-bold text-[#425C59]">
                Passo {indiceAtual + 1} de {slides.length}
              </p>

              <h3 className="text-2xl font-bold leading-tight text-black sm:text-3xl">
                {slideAtual.titulo}
              </h3>

              <p className="mt-4 text-base leading-8 text-black/70">
                {slideAtual.descricao}
              </p>
            </div>

            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={voltarSlide}
                disabled={primeiroSlide}
                className="rounded-xl border border-black/10 px-5 py-3 text-sm font-bold text-black transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Voltar
              </button>

              <button
                type="button"
                onClick={avancarSlide}
                className="rounded-xl bg-[#FFC222] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#eab308]"
              >
                {ultimoSlide ? "Começar" : "Próximo →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
