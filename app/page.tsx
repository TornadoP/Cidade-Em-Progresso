"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
{
  /* P A G I N A    P R I N C I P A L*/
}

//Tornar clicavel, tanto foto nome ou qualquer parte dentro do quadrado ou seja div, para encaminhar para o link

// Aqui é o código para o sistema funcionar, não mexa aqui comece após o main

//function coresRosca -- configurações das cores dos graficos do card vertical
// function roscaProgresso -- configurações do gráfico de rosca do card vertical

function coresRosca(progresso: number) {
  if (progresso < 50) {
    return {
      inicio: "#EF4444",
      fim: "#FACC15",
    };
  }

  if (progresso < 75) {
    return {
      inicio: "#FACC15",
      fim: "#84CC16",
    };
  }

  return {
    inicio: "#86EFAC",
    fim: "#425C59",
  };
}
function RoscaProgresso({ progresso }: { progresso: number }) {
  const cores = coresRosca(progresso);

  return (
    <div
      className="rosca-conic-animada relative flex h-20 w-20 items-center justify-center rounded-full"
      style={
        {
          "--progresso-rosca": `${progresso}%`,
          "--cor-inicio": cores.inicio,
          "--cor-fim": cores.fim,
        } as CSSProperties
      }
    >
      <div className="absolute h-14 w-14 rounded-full bg-white"></div>

      <span className="absolute text-sm font-semibold text-black">
        {progresso}%
      </span>
    </div>
  );
}
export default function Home() {
  const [pesquisa, setPesquisa] = useState("");
  const router = useRouter();

  function buscarObra() {
    if (!pesquisa.trim()) return;

    router.push(`/rotas/obras?pesquisa=${encodeURIComponent(pesquisa)}`);
  }
  function corProgresso(progresso: number) {
    if (progresso < 50) {
      return "bg-gradient-to-r from-[#EF4444] to-[#FACC15]";
    }

    if (progresso < 75) {
      return "bg-gradient-to-r from-[#FACC15] to-[#84CC16]";
    }

    return "bg-gradient-to-r from-[#86EFAC] to-[#425C59]";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#C9D9DB] shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:min-h-[650px] md:flex-row">
        {/* SIDEBAR ESQUERDA - a cor #FFC222  é #D8CBD4 um tom de roxo, ou lilas  #4B5563 #425C59  #C9D9DB*/}
        <aside className="flex w-full flex-col bg-[#425C59]/35 px-5 py-5 text-black md:w-56">
          {" "}
          <h1 className="mb-6 text-center text-xl font-semibold md:text-left">
            Cidade em Progresso
          </h1>
          {/* logo */}
          <div className="mb-6 flex justify-center md:mb-8">
            <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#D9B8C4] md:h-36 md:w-36">
              {" "}
              <Image
                src="/logo.png"
                alt="Logo Cidade em Progresso"
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
          </div>
          <nav className="flex overflow-x-auto gap-3 text-sm md:flex-col md:overflow-visible">
            {" "}
            <a
              className="rounded-xl bg-[#FFC222] px-4 py-3 font-medium"
              href="#"
            >
              Inicio
            </a>
            <Link
              className="rounded-xl px-4 py-3 transition hover:bg-[#FFC222]"
              href="/rotas/obras"
            >
              Obras
            </Link>
            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#FFC222]"
              href="#"
            >
              Votar
            </a>
            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#FFC222]"
              href="#"
            >
              Ranking
            </a>
            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#FFC222]"
              href="#"
            >
              Sobre
            </a>
          </nav>
        </aside>
        {/* ÁREA PRINCIPAL DA DIREITA */}
        <section className="flex flex-1 flex-col px-4 py-6 sm:px-6 md:px-10 md:py-8">
          <div className="mx-auto flex w-full max-w-[662px] flex-1 flex-col">
            {/* Topo: pesquisa + ícones */}
            <div className="mb-6 flex w-full flex-col gap-4 md:mb-8 lg:flex-row lg:items-center">
              {" "}
              <div className="flex w-full max-w-[320px] items-center gap-3 rounded-full border border-zinc-300 bg-white/70 px-4 py-2 shadow-sm backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-zinc-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>

                <input
                  type="text"
                  placeholder="Pesquisar"
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      buscarObra();
                    }
                  }}
                  className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                />
              </div>
              {/* Ícones de usuário e logout */}
              <div className="flex items-center gap-3 lg:ml-[132px]">
                {/* Botão usuário */}
                <button
                  type="button"
                  aria-label="Perfil do usuário"
                  onClick={() => alert("Abrir perfil do usuário")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#425C59] shadow-sm transition hover:scale-105 hover:bg-[#334846]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 0115 0"
                    />
                  </svg>
                </button>

                {/* Botão logout */}
                <button
                  type="button"
                  aria-label="Sair da conta"
                  onClick={() => alert("Deslogar usuário")}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#425C59] shadow-sm transition hover:scale-105 hover:bg-[#334846]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Card central com imagem e descrição + Outras obras */}
            <div className="flex flex-1 flex-col items-stretch justify-center gap-6 lg:flex-row lg:gap-8">
              {/* Card principal */}
              <div className="w-full rounded-3xl bg-[#425C59] p-5 shadow-xl lg:w-[420px]">
                {/* Área da imagem */}
                <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-white/20 sm:h-[320px] md:h-[360px]">
                  <Image
                    src="/obra-principal.png"
                    alt="Imagem da obra principal"
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-cover"
                  />
                </div>

                {/* Área da descrição */}
                <div className="mt-5 rounded-2xl bg-white/10 p-4">
                  <h2 className="text-xl font-semibold text-white">
                    Título da obra
                  </h2>

                  {/* Barra de progresso */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/80">
                      <span>Progresso</span>
                      <span>72%</span>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className={`h-full rounded-full barra-progresso-animada ${corProgresso(72)}`}
                        style={{ "--progresso": "72%" } as CSSProperties}
                      ></div>
                    </div>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-white/80">
                    Aqui você pode colocar uma descrição sobre a obra,
                    andamento, localização ou informações importantes para o
                    cidadão.
                  </p>
                </div>

                <Link
                  href="/rotas/obras/reforma-praca-central"
                  className="mt-5 block w-full rounded-xl bg-[#FFC222] px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-[#eab308]"
                >
                  Ver detalhes
                </Link>
              </div>

              {/* Outras Obras */}
              <div className="flex w-full flex-col rounded-3xl bg-[#425C59] p-5 shadow-xl lg:w-[210px]">
                <p className="mb-4 text-xl font-semibold text-white">
                  Outras Obras
                </p>

                <div className="flex gap-4 overflow-x-auto lg:flex-1 lg:flex-col lg:justify-between lg:overflow-visible">
                  {/* Gráfico 1 */}
                  <div className="flex h-[160px] min-w-[160px] flex-col items-center justify-center rounded-lg bg-white lg:h-auto lg:min-w-0 lg:flex-1">
                    <p className="mb-2 text-sm font-medium text-black">
                      Rua Maneco Rego
                    </p>

                    <RoscaProgresso progresso={70} />
                  </div>

                  {/* Gráfico 2 */}
                  <div className="flex h-[160px] min-w-[160px] flex-col items-center justify-center rounded-lg bg-white lg:h-auto lg:min-w-0 lg:flex-1">
                    <p className="mb-2 text-sm font-medium text-black">
                      Rua João Pessoa
                    </p>

                    <RoscaProgresso progresso={99} />
                  </div>

                  {/* Gráfico 3 */}
                  <div className="flex h-[160px] min-w-[160px] flex-col items-center justify-center rounded-lg bg-white lg:h-auto lg:min-w-0 lg:flex-1">
                    <p className="mb-2 text-sm font-medium text-black">
                      Rua do Ifma de terra
                    </p>

                    <RoscaProgresso progresso={49} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
