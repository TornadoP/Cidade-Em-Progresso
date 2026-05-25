"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { CSSProperties, Dispatch, SetStateAction } from "react";

type Obra = {
  id: string;
  fonte_id: string | null;
  titulo: string;
  local: string | null;
  investimento: string | null;
  inicio: string | null;
  prazo: string | null;
  progresso: string | null;
  status: string | null;
  tipo: string | null;
  imagem: string | null;
  descricao: string | null;
  detalhes: string | null;
  orgao: string | null;
  empresa: string | null;
  ultima_atualizacao: string | null;
  total_votos: number | null;
};

export default function ObrasClient({
  obras,
  pesquisaInicial,
}: {
  obras: Obra[];
  pesquisaInicial: string;
}) {
  const [pesquisa, setPesquisa] = useState(pesquisaInicial);
  const [statusSelecionados, setStatusSelecionados] = useState<string[]>([]);
  const [tiposSelecionados, setTiposSelecionados] = useState<string[]>([]);

  const obrasFiltradas = obras.filter((obra) => {
    const texto = pesquisa.toLowerCase();

    const titulo = obra.titulo?.toLowerCase() || "";
    const local = obra.local?.toLowerCase() || "";
    const status = obra.status?.toLowerCase() || "";

    const correspondePesquisa =
      titulo.includes(texto) || local.includes(texto) || status.includes(texto);

    const correspondeStatus =
      statusSelecionados.length === 0 ||
      statusSelecionados.includes(obra.status || "");

    const correspondeTipo =
      tiposSelecionados.length === 0 ||
      tiposSelecionados.includes(obra.tipo || "");

    return correspondePesquisa && correspondeStatus && correspondeTipo;
  });

  function corProgresso(progresso: string | null) {
    const valor = Number((progresso || "0%").replace("%", ""));

    if (valor < 50) {
      return "bg-gradient-to-r from-[#EF4444] to-[#FACC15]";
    }

    if (valor < 75) {
      return "bg-gradient-to-r from-[#FACC15] to-[#84CC16]";
    }

    return "bg-gradient-to-r from-[#86EFAC] to-[#425C59]";
  }
  function progressoReal(status: string | null, progresso: string | null) {
    if (status === "Em planejamento") {
      return "0%";
    }

    return progresso || "0%";
  }

  function alternarFiltro(
    valor: string,
    lista: string[],
    atualizarLista: Dispatch<SetStateAction<string[]>>,
  ) {
    if (lista.includes(valor)) {
      atualizarLista(lista.filter((item) => item !== valor));
    } else {
      atualizarLista([...lista, valor]);
    }
  }
  function alternarFiltroStatus(valor: string) {
    if (statusSelecionados.includes(valor)) {
      setStatusSelecionados([]);
    } else {
      setStatusSelecionados([valor]);
    }
  }
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
              Votar
            </Link>

            <Link
              href="/rotas/ranking"
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
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                    checked={statusSelecionados.includes("Em andamento")}
                    onChange={() => alternarFiltroStatus("Em andamento")}
                  />
                  Em andamento
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                    checked={statusSelecionados.includes("Em planejamento")}
                    onChange={() => alternarFiltroStatus("Em planejamento")}
                  />
                  Em planejamento
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                    checked={statusSelecionados.includes("Concluída")}
                    onChange={() => alternarFiltroStatus("Concluída")}
                  />
                  Concluída
                </label>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-white/90">
                  Tipo de obra
                </h3>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                    checked={tiposSelecionados.includes("Pavimentação")}
                    onChange={() =>
                      alternarFiltro(
                        "Pavimentação",
                        tiposSelecionados,
                        setTiposSelecionados,
                      )
                    }
                  />
                  Pavimentação
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                    checked={tiposSelecionados.includes("Saúde")}
                    onChange={() =>
                      alternarFiltro(
                        "Saúde",
                        tiposSelecionados,
                        setTiposSelecionados,
                      )
                    }
                  />
                  Saúde
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                    checked={tiposSelecionados.includes("Educação")}
                    onChange={() =>
                      alternarFiltro(
                        "Educação",
                        tiposSelecionados,
                        setTiposSelecionados,
                      )
                    }
                  />
                  Educação
                </label>

                <label className="mb-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                    checked={tiposSelecionados.includes("Lazer")}
                    onChange={() =>
                      alternarFiltro(
                        "Lazer",
                        tiposSelecionados,
                        setTiposSelecionados,
                      )
                    }
                  />
                  Lazer
                </label>
              </div>
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
                <Link
                  key={obra.id}
                  href={`/rotas/obras/${obra.fonte_id || obra.id}`}
                  className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_30px_70px_rgba(0,0,0,0.42)]"
                >
                  <div className="relative h-44 w-full bg-[#425C59]/20">
                    <Image
                      src={obra.imagem || "/obra-principal.png"}
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

                    <p className="mt-1 text-sm font-medium text-[#425C59]">
                      {obra.status || "Em planejamento"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-black/70">
                      🗳️ {obra.total_votos || 0} voto
                      {Number(obra.total_votos || 0) === 1 ? "" : "s"}
                    </p>

                    <div className="mt-3 grid gap-2 text-sm text-black/70">
                      <p>
                        <span className="font-semibold text-black">
                          📍 Localização:
                        </span>{" "}
                        {obra.local || "Local não informado"}
                      </p>

                      <p>
                        <span className="font-semibold text-black">
                          🏦 Investimento:
                        </span>{" "}
                        {obra.investimento || "Não informado"}
                      </p>

                      <p>
                        <span className="font-semibold text-black">
                          🚧 Início:
                        </span>{" "}
                        {obra.inicio || "Não informado"}
                      </p>

                      <p>
                        <span className="font-semibold text-black">
                          📅 Prazo:
                        </span>{" "}
                        {obra.prazo || "Não informado"}
                      </p>
                    </div>

                    <div className="mt-4 mb-5">
                      <div className="mb-1 flex items-center justify-between text-xs text-black/70">
                        <span>Progresso</span>
                        <span>
                          {progressoReal(obra.status, obra.progresso)}
                        </span>
                      </div>

                      <div className="h-3 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
                        <div
                          className={`h-full rounded-full barra-progresso-animada ${corProgresso(
                            progressoReal(obra.status, obra.progresso),
                          )}`}
                          style={
                            {
                              "--progresso": progressoReal(
                                obra.status,
                                obra.progresso,
                              ),
                            } as CSSProperties
                          }
                        ></div>
                      </div>
                    </div>

                    <span className="mt-auto block w-full rounded-xl bg-[#425C59] px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#334846]">
                      Ver detalhes
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
