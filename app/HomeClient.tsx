"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AcoesUsuario from "@/app/components/AcoesUsuario";
import GuiaInicial from "@/app/components/GuiaInicial";
import SeloOrigemObra from "@/app/components/SeloOrigemObra";

type Obra = {
  id: string;
  fonte_id: string | null;
  titulo: string;
  progresso: string | null;
  status: string | null;
  tipo: string | null;
  imagem: string | null;
  descricao: string | null;
  origem: string | null;
};
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
export default function HomeClient({ obras }: { obras: Obra[] }) {
  const [pesquisa, setPesquisa] = useState("");
  const [indiceObraPrincipal, setIndiceObraPrincipal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (obras.length === 0) return;

    const intervalo = setInterval(() => {
      setIndiceObraPrincipal((indiceAtual) =>
        indiceAtual + 1 >= obras.length ? 0 : indiceAtual + 1,
      );
    }, 6000);

    return () => clearInterval(intervalo);
  }, [obras.length]);

  if (obras.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-xl font-bold text-black">
            Nenhuma obra encontrada
          </h1>
          <p className="mt-2 text-sm text-black/70">
            Cadastre obras no Supabase para exibir na página inicial.
          </p>
        </div>
      </div>
    );
  }

  const obraPrincipal = obras[indiceObraPrincipal];

  const outrasObras = obras
    .filter((obra) => obra.id !== obraPrincipal.id)
    .slice(0, 3);

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
  function progressoReal(status: string | null, progresso: string | null) {
    if (status === "Em planejamento") {
      return 0;
    }

    const numero = Number(String(progresso || "0").replace("%", ""));

    if (Number.isNaN(numero)) {
      return 0;
    }

    return Math.max(0, Math.min(100, Math.round(numero)));
  }

  function limitarTexto(texto: string | null, limite = 145) {
    if (!texto) return "Descrição não informada.";

    const limpo = texto.replace(/\s+/g, " ").trim();

    if (limpo.length <= limite) return limpo;

    return `${limpo.slice(0, limite).trim()}...`;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <GuiaInicial />

      <main className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#F1F5F9] shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:min-h-[650px] md:flex-row">
        {/* SIDEBAR ESQUERDA - a cor #FFC222  é #D8CBD4 um tom de roxo, ou lilas  #4B5563 #425C59  #C9D9DB*/}
        <aside className="flex w-full flex-col items-center bg-[#425C59]/35 px-5 py-5 text-black md:w-56 md:items-stretch">
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
          <nav className="flex flex-wrap justify-center gap-3 text-sm md:flex-col md:flex-nowrap md:justify-start">
            <Link
              className="rounded-xl bg-[#FFC222] px-4 py-3 font-medium text-black"
              href="/"
            >
              Início
            </Link>

            <Link
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
              href="/rotas/obras"
            >
              Obras
            </Link>

            <Link
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
              href="/rotas/participar"
            >
              Participar
            </Link>

            <Link
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
              href="/rotas/ranking"
            >
              Ranking
            </Link>

            <Link
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
              href="/rotas/sobre"
            >
              Sobre
            </Link>
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
                  placeholder="Busque por asfalto, escola, saúde, buraco, praça..."
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
                <AcoesUsuario />
              </div>
            </div>

            {/* Card central com imagem e descrição + Outras obras */}
            <div className="flex flex-1 flex-col items-stretch justify-center gap-6 lg:flex-row lg:gap-8">
              {/* Card principal */}
              <Link
                key={obraPrincipal.id}
                href={`/rotas/obras/${obraPrincipal.fonte_id || obraPrincipal.id}`}
                className="animacao-troca-obra flex w-full flex-col rounded-3xl bg-[#425C59] p-5 shadow-xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_35px_80px_rgba(0,0,0,0.55)] lg:w-[420px]"
              >
                {/* Área da imagem */}
                <div className="relative h-[260px] w-full overflow-hidden rounded-2xl bg-white/20 sm:h-[320px] md:h-[360px]">
                  <div className="absolute left-4 top-4 z-10">
                    <SeloOrigemObra origem={obraPrincipal.origem} />
                  </div>

                  <Image
                    src={obraPrincipal.imagem || "/obra-principal.png"}
                    alt={obraPrincipal.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, 420px"
                    className="object-cover"
                  />
                </div>

                {/* Área da descrição */}
                <div className="mt-5 flex flex-1 flex-col rounded-2xl bg-white/10 p-4">
                  <h2 className="text-xl font-semibold text-white">
                    {obraPrincipal.titulo}
                  </h2>

                  {/* Barra de progresso */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-white/80">
                      <span>Progresso</span>
                      <span>
                        {progressoReal(
                          obraPrincipal.status,
                          obraPrincipal.progresso,
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className={`h-full rounded-full ${corProgresso(
                          progressoReal(
                            obraPrincipal.status,
                            obraPrincipal.progresso,
                          ),
                        )}`}
                        style={{
                          width: `${progressoReal(
                            obraPrincipal.status,
                            obraPrincipal.progresso,
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/80">
                    {limitarTexto(obraPrincipal.descricao, 145)}
                  </p>
                </div>
                <span className="mt-5 block w-full rounded-xl bg-[#FFC222] px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-[#eab308]">
                  Ver detalhes
                </span>
              </Link>

              {/* Outras Obras */}
              <div className="flex w-full flex-col rounded-3xl bg-[#425C59] p-5 shadow-xl lg:w-[210px]">
                <p className="mb-4 text-xl font-semibold text-white">
                  Outras Obras
                </p>

                <div className="flex gap-4 overflow-x-auto lg:flex-1 lg:flex-col lg:justify-between lg:overflow-visible">
                  {outrasObras.map((obra) => (
                    <Link
                      key={obra.id}
                      href={`/rotas/obras/${obra.fonte_id || obra.id}`}
                      className="animacao-troca-obra flex h-[160px] min-w-[160px] flex-col items-center justify-center rounded-lg bg-white px-3 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl lg:h-auto lg:min-w-0 lg:flex-1"
                    >
                      <SeloOrigemObra
                        origem={obra.origem}
                        className="mb-2 scale-90"
                      />

                      <p className="mb-2 line-clamp-2 text-sm font-medium text-black">
                        {obra.titulo}
                      </p>

                      <RoscaProgresso
                        progresso={progressoReal(obra.status, obra.progresso)}
                      />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
