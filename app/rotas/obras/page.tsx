"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
{
  /* P A G I N A    D E    N A V E G A Ç Ã O*/
}

const obras = [
  {
    titulo: "Reforma da Praça Central",
    local: "Centro, Pedreiras",
    progresso: "72%",
    status: "Em andamento",
    imagem: "/obra-principal.png",
  },
  {
    titulo: "Pavimentação Rua Maneco Rego",
    local: "Bairro Centro",
    progresso: "70%",
    status: "Em andamento",
    imagem: "/obra-principal.png",
  },
  {
    titulo: "Construção de Escola Municipal",
    local: "Bairro Novo",
    progresso: "45%",
    status: "Planejada",
    imagem: "/obra-principal.png",
  },
  {
    titulo: "Reforma da UBS",
    local: "Bairro Mutirão",
    progresso: "85%",
    status: "Quase concluída",
    imagem: "/obra-principal.png",
  },
];

function ObrasContent() {
  const searchParams = useSearchParams();
  const pesquisaInicial = searchParams.get("pesquisa") || "";
  const [pesquisa, setPesquisa] = useState(pesquisaInicial);

  const obrasFiltradas = obras.filter((obra) => {
    const texto = pesquisa.toLowerCase();

    return (
      obra.titulo.toLowerCase().includes(texto) ||
      obra.local.toLowerCase().includes(texto) ||
      obra.status.toLowerCase().includes(texto)
    );
  });
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="w-full max-w-6xl overflow-hidden rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        {/* Navegação superior */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-2xl font-bold text-black">Cidade em Progresso</h1>

          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Início
            </Link>

            <Link
              href="/rotas/obras"
              className="rounded-xl bg-[#FFC222] px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Obras
            </Link>

            <Link
              href="#"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Participar
            </Link>

            <Link
              href="#"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Ranking
            </Link>

            <Link
              href="#"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Sobre
            </Link>
          </nav>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Filtros */}
          <aside className="rounded-3xl bg-[#425C59] p-5 text-white shadow-xl">
            <h2 className="mb-5 text-xl font-semibold">Filtros</h2>

            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white/90">
                  Status
                </h3>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" />
                  Em andamento
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" />
                  Planejada
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" />
                  Concluída
                </label>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-white/90">
                  Tipo de obra
                </h3>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" />
                  Pavimentação
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" />
                  Saúde
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" />
                  Educação
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4" />
                  Lazer
                </label>
              </div>

              <button className="mt-4 w-full rounded-xl bg-[#CBDfde] px-4 py-3 text-sm font-semibold text-black transition hover:bg-white">
                Aplicar filtros
              </button>
            </div>
          </aside>

          {/* Lista de obras */}
          <section>
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Todas as obras
                </h2>
              </div>

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
                  placeholder="Pesquisar obra"
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {obrasFiltradas.map((obra) => (
                <article
                  key={obra.titulo}
                  className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
                >
                  <div className="relative h-44 w-full bg-[#425C59]/20">
                    <Image
                      src={obra.imagem}
                      alt={obra.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="min-h-[56px] text-lg font-bold text-black">
                      {obra.titulo}
                    </h3>

                    <p className="mt-1 text-sm text-black/70">{obra.local}</p>

                    <div className="mt-4 mb-5">
                      <div className="mb-1 flex items-center justify-between text-xs text-black/70">
                        <span>{obra.status}</span>
                        <span>{obra.progresso}</span>
                      </div>

                      <div className="h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#EF4444] via-[#FACC15] to-[#22C55E]"
                          style={{ width: obra.progresso }}
                        ></div>
                      </div>
                    </div>

                    <button className="mt-auto w-full rounded-xl bg-[#425C59] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#334846]">
                      Ver detalhes
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
export default function ObrasPage() {
  return (
    <Suspense fallback={<div>Carregando obras...</div>}>
      <ObrasContent />
    </Suspense>
  );
}
