"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import AcoesUsuario from "@/app/components/AcoesUsuario";
import SeloOrigemObra from "@/app/components/SeloOrigemObra";

type Obra = {
  id: string;
  fonte_id: string | null;
  titulo: string;
  local: string | null;
  investimento: string | null;
  inicio: string | null;
  prazo: string | null;
  progresso: number | string | null;
  status: string | null;
  tipo: string | null;
  imagem: string | null;
  descricao: string | null;
  bairro?: string | null;
  orgao: string | null;
  empresa: string | null;
  total_votos: number | null;
  origem: string | null;
};

const filtrosTipo = [
  "Educação",
  "Saúde",
  "Infraestrutura",
  "Lazer",
  "Patrimônio público",
];

const filtrosStatus = [
  "Em planejamento",
  "Em andamento",
  "Concluída",
  "Cancelada",
];

const filtrosOrigem = ["Oficial", "Sugestão popular"];

const termosRelacionados: Record<string, string[]> = {
  asfalto: [
    "asfaltica",
    "asfaltico",
    "pavimentacao",
    "pavimentar",
    "pavimentada",
    "recapeamento",
    "rua",
    "avenida",
    "estrada",
    "via",
    "buraco",
  ],
  pavimentacao: [
    "asfalto",
    "asfaltica",
    "asfaltico",
    "pavimentar",
    "recapeamento",
    "calçamento",
    "calcamento",
    "rua",
    "estrada",
    "buraco",
  ],
  buraco: ["asfalto", "pavimentacao", "recapeamento", "rua", "estrada", "via"],
  escola: [
    "educacao",
    "ensino",
    "creche",
    "colegio",
    "infancia",
    "sala de aula",
    "unidade de ensino",
  ],
  educacao: [
    "escola",
    "creche",
    "ensino",
    "colegio",
    "infancia",
    "aluno",
    "sala de aula",
    "unidade de ensino",
  ],
  creche: [
    "educacao",
    "escola",
    "ensino",
    "colegio",
    "infancia",
    "aluno",
    "sala de aula",
    "unidade de ensino",
  ],
  saude: [
    "hospital",
    "ubs",
    "posto de saude",
    "unidade basica",
    "medico",
    "atendimento",
    "samu",
  ],
  hospital: [
    "saude",
    "ubs",
    "posto de saude",
    "unidade basica",
    "atendimento",
    "medico",
  ],
  posto: [
    "saude",
    "hospital",
    "ubs",
    "posto de saude",
    "unidade basica",
    "atendimento",
    "medico",
  ],
  ubs: [
    "saude",
    "hospital",
    "posto",
    "posto de saude",
    "unidade basica",
    "atendimento",
    "medico",
  ],
  drenagem: [
    "esgoto",
    "saneamento",
    "alagamento",
    "enchente",
    "bueiro",
    "galeria",
    "agua",
  ],
  saneamento: [
    "esgoto",
    "drenagem",
    "alagamento",
    "enchente",
    "bueiro",
    "galeria",
  ],
  alagamento: [
    "drenagem",
    "saneamento",
    "esgoto",
    "enchente",
    "bueiro",
    "galeria",
    "agua",
  ],
  praça: [
    "praca",
    "lazer",
    "parque",
    "quadra",
    "espaco publico",
    "convivencia",
  ],
  praca: [
    "praça",
    "lazer",
    "parque",
    "quadra",
    "espaco publico",
    "convivencia",
  ],
  lazer: [
    "praca",
    "praça",
    "parque",
    "quadra",
    "ginásio",
    "ginasio",
    "esporte",
  ],
  iluminacao: [
    "luz",
    "poste",
    "lampada",
    "energia",
    "escuro",
    "iluminação publica",
  ],
  luz: ["iluminacao", "poste", "lampada", "energia", "escuro"],
  seguranca: ["iluminacao", "luz", "poste", "escuro", "risco"],
  ponte: ["travessia", "rio", "passagem", "estrutura metalica", "acesso"],
  mercado: ["feira", "comercio", "box", "vendedor", "mercado municipal"],
  predio: [
    "prédio",
    "sede",
    "secretaria",
    "patrimonio",
    "patrimônio",
    "reforma",
  ],
  reforma: [
    "manutencao",
    "adequacao",
    "melhoria",
    "recuperacao",
    "restauracao",
    "conserto",
  ],
  manutencao: ["reforma", "adequacao", "conserto", "recuperacao", "melhoria"],
};

function normalizarBusca(texto: string | null | undefined) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/\s+/g, " ")
    .trim();
}

function expandirTermosBusca(busca: string) {
  const buscaNormalizada = normalizarBusca(busca);

  if (!buscaNormalizada) return [];

  const palavras = buscaNormalizada
    .split(" ")
    .map((palavra) => palavra.trim())
    .filter(Boolean);

  const termos = new Set<string>();

  termos.add(buscaNormalizada);

  for (const palavra of palavras) {
    termos.add(palavra);

    const relacionados = termosRelacionados[palavra] || [];

    for (const termo of relacionados) {
      termos.add(normalizarBusca(termo));
    }
  }

  return Array.from(termos);
}

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
  const [origensSelecionadas, setOrigensSelecionadas] = useState<string[]>([]);

  const termosBusca = expandirTermosBusca(pesquisa);

  const obrasFiltradas = obras.filter((obra) => {
    const textoDaObra = normalizarBusca(`
      ${obra.titulo}
      ${obra.descricao}
      ${obra.local}
      ${obra.bairro}
      ${obra.tipo}
      ${obra.status}
      ${obra.origem}
      ${obra.orgao}
      ${obra.empresa}
    `);

    const correspondePesquisa =
      termosBusca.length === 0 ||
      termosBusca.some((termo) => textoDaObra.includes(termo));

    const correspondeStatus =
      statusSelecionados.length === 0 ||
      statusSelecionados.includes(obra.status || "");

    const correspondeOrigem =
      origensSelecionadas.length === 0 ||
      origensSelecionadas.includes(obra.origem || "");

    const correspondeTipo =
      tiposSelecionados.length === 0 ||
      tiposSelecionados.includes(obra.tipo || "");

    return (
      correspondePesquisa &&
      correspondeStatus &&
      correspondeTipo &&
      correspondeOrigem
    );
  });

  function corProgresso(progresso: number) {
    if (progresso < 50) {
      return "bg-gradient-to-r from-[#EF4444] to-[#FACC15]";
    }

    if (progresso < 75) {
      return "bg-gradient-to-r from-[#FACC15] to-[#84CC16]";
    }

    return "bg-gradient-to-r from-[#86EFAC] to-[#425C59]";
  }

  function progressoReal(
    status: string | null,
    progresso: number | string | null,
  ) {
    if (status === "Em planejamento") {
      return 0;
    }

    const valor =
      typeof progresso === "string"
        ? Number(progresso.replace("%", ""))
        : Number(progresso);

    return Math.max(
      0,
      Math.min(100, Number.isNaN(valor) ? 0 : Math.round(valor)),
    );
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
    setStatusSelecionados((statusAtual) =>
      statusAtual.includes(valor) ? [] : [valor],
    );
  }

  function limparFiltros() {
    setPesquisa("");
    setStatusSelecionados([]);
    setTiposSelecionados([]);
    setOrigensSelecionadas([]);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="w-full max-w-6xl overflow-hidden rounded-3xl bg-[#D9EAF7] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        {/* Navegação superior */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-2xl font-bold text-black">Cidade em Progresso</h1>
          <AcoesUsuario />
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
              href="/rotas/participar"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Participar
            </Link>

            <Link
              href="/rotas/ranking"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Ranking
            </Link>

            <Link
              href="/rotas/sobre"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Sobre
            </Link>
          </nav>
        </header>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Filtros */}
          <aside className="rounded-3xl bg-[#425C59] p-5 text-white shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Filtros</h2>

              <button
                type="button"
                onClick={limparFiltros}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/20"
              >
                Limpar
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-white/90">
                  Status
                </h3>

                {filtrosStatus.map((status) => (
                  <label
                    key={status}
                    className="mb-2 flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                      checked={statusSelecionados.includes(status)}
                      onChange={() => alternarFiltroStatus(status)}
                    />
                    {status}
                  </label>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-white/70">
                  Origem
                </h3>

                {filtrosOrigem.map((origem) => (
                  <label
                    key={origem}
                    className="mb-2 flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                      checked={origensSelecionadas.includes(origem)}
                      onChange={() =>
                        alternarFiltro(
                          origem,
                          origensSelecionadas,
                          setOrigensSelecionadas,
                        )
                      }
                    />
                    {origem}
                  </label>
                ))}
              </div>

              <div>
                <h3 className="mb-3 text-sm font-semibold text-white/90">
                  Tipo de obra
                </h3>

                {filtrosTipo.map((tipo) => (
                  <label
                    key={tipo}
                    className="mb-2 flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-[#FFC222]"
                      checked={tiposSelecionados.includes(tipo)}
                      onChange={() =>
                        alternarFiltro(
                          tipo,
                          tiposSelecionados,
                          setTiposSelecionados,
                        )
                      }
                    />
                    {tipo}
                  </label>
                ))}
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
                  placeholder="Busque por asfalto, escola, saúde, buraco, praça..."
                  value={pesquisa}
                  onChange={(event) => setPesquisa(event.target.value)}
                  className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {obrasFiltradas.map((obra) => {
                const progressoObra = progressoReal(
                  obra.status,
                  obra.progresso,
                );

                return (
                  <Link
                    key={obra.id}
                    href={`/rotas/obras/${obra.fonte_id || obra.id}`}
                    className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-3xl bg-white shadow-[0_18px_45px_rgba(0,0,0,0.28)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:shadow-[0_30px_70px_rgba(0,0,0,0.42)]"
                  >
                    <div className="relative h-52 w-full shrink-0 bg-[#425C59]/20">
                      <div className="absolute left-4 top-4 z-10">
                        <SeloOrigemObra origem={obra.origem} />
                      </div>

                      <Image
                        src={obra.imagem || "/obra-principal.png"}
                        alt={obra.titulo}
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      <div className="min-h-[112px]">
                        <h3 className="h-[56px] overflow-hidden text-xl font-bold leading-7 text-black">
                          {obra.titulo}
                        </h3>

                        <p className="mt-2 h-[40px] overflow-hidden text-sm leading-5 text-black/60">
                          📍 {obra.local || "Local não informado"}
                        </p>
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-black/70">
                        <p>
                          <span className="font-semibold text-black">
                            🚦 Status:
                          </span>{" "}
                          {obra.status || "Em planejamento"}
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

                        <p>
                          <span className="font-semibold text-black">
                            🗳️ Votos:
                          </span>{" "}
                          {obra.total_votos || 0}
                        </p>
                      </div>

                      <div className="mt-auto pt-5">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-black/70">
                            Progresso
                          </span>
                          <span className="font-bold text-[#425C59]">
                            {progressoObra}%
                          </span>
                        </div>

                        <div className="h-3 w-full overflow-hidden rounded-full bg-zinc-200">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${corProgresso(
                              progressoObra,
                            )}`}
                            style={{ width: `${progressoObra}%` }}
                          ></div>
                        </div>

                        <span className="mt-5 block w-full rounded-xl bg-[#FFC222] px-4 py-3 text-center text-sm font-bold text-black transition hover:bg-[#eab308]">
                          Ver detalhes
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
