import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { obras } from "@/app/data/obras";

//P A G I N A    D E   D E T A L H E S  O B R A S

function corProgresso(progresso: string) {
  const valor = Number(progresso.replace("%", ""));

  if (valor < 50) {
    return "bg-gradient-to-r from-[#EF4444] to-[#FACC15]";
  }

  if (valor < 75) {
    return "bg-gradient-to-r from-[#FACC15] to-[#84CC16]";
  }

  return "bg-gradient-to-r from-[#86EFAC] to-[#425C59]";
}
function corStatus(status: string) {
  if (status === "Concluída") {
    return {
      fundo: "bg-green-100",
      texto: "text-green-800",
      bolinha: "bg-green-500",
    };
  }

  if (status === "Em andamento") {
    return {
      fundo: "bg-yellow-100",
      texto: "text-yellow-800",
      bolinha: "bg-yellow-500",
    };
  }

  if (status === "Em planejamento") {
    return {
      fundo: "bg-blue-100",
      texto: "text-blue-800",
      bolinha: "bg-blue-500",
    };
  }

  return {
    fundo: "bg-zinc-100",
    texto: "text-zinc-800",
    bolinha: "bg-zinc-500",
  };
}
export async function generateStaticParams() {
  return obras.map((obra) => ({
    id: obra.id,
  }));
}

export default async function DetalhesObraPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const obra = obras.find((item) => item.id === id);

  if (!obra) {
    notFound();
  }
  const statusCores = corStatus(obra.status);
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="mx-auto w-full max-w-7xl rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        {/* Topo */}
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Cidade em Progresso
            </h1>

            <p className="mt-6 text-sm text-black/70">
              <Link href="/rotas/obras" className="hover:underline">
                Obras
              </Link>{" "}
              / Detalhes da obra
            </p>
          </div>

          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Início
            </Link>

            <Link
              href="/rotas/obras"
              className="rounded-xl bg-[#FFC222] px-4 py-3 font-medium text-black transition hover:bg-[#eab308]"
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

        {/* Área principal */}
        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          {/* Imagem grande */}
          <div className="relative min-h-[280px] overflow-hidden rounded-3xl bg-[#425C59]/20 shadow-xl ring-1 ring-white/30 sm:min-h-[360px] lg:min-h-[420px]">
            <Image
              src={obra.imagem}
              alt={obra.titulo}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 720px"
              className="object-cover"
            />
          </div>

          {/* Card resumo */}
          <aside className="rounded-3xl bg-[#425C59] p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.35)] ring-1 ring-white/20">
            <h2 className="text-2xl font-bold">{obra.titulo}</h2>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${statusCores.fundo} ${statusCores.texto}`}
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${statusCores.bolinha}`}
                ></span>
                {obra.status}
              </span>

              <Link
                href={`/rotas/obras/${obra.id}/votar`}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-base font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-blue-700 hover:shadow-xl"
              >
                👍 Votar nesta obra
              </Link>
            </div>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm text-white/90">
                <span>Progresso da obra</span>
                <span className="text-xl font-bold">{obra.progresso}</span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
                <div
                  className={`h-full rounded-full barra-progresso-animada ${corProgresso(
                    obra.progresso,
                  )}`}
                  style={
                    {
                      "--progresso": obra.progresso,
                    } as CSSProperties
                  }
                ></div>
              </div>
            </div>

            <div className="mt-6 h-px bg-white/20"></div>

            <div className="mt-6 grid gap-4 text-sm">
              <div className="grid grid-cols-[150px_1fr] gap-3">
                <span className="font-semibold text-white">📍 Localização</span>
                <span className="text-white/85">{obra.local}</span>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3">
                <span className="font-semibold text-white">
                  🏦 Investimento
                </span>
                <span className="text-white/85">{obra.investimento}</span>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3">
                <span className="font-semibold text-white">
                  🚧 Data de início
                </span>
                <span className="text-white/85">{obra.inicio}</span>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3">
                <span className="font-semibold text-white">📅 Prazo</span>
                <span className="text-white/85">{obra.prazo}</span>
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-3">
                <span className="font-semibold text-white">🏗️ Tipo</span>
                <span className="text-white/85">{obra.tipo}</span>
              </div>
            </div>
          </aside>
        </section>

        {/* Cards inferiores */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.65fr_0.8fr]">
          {/* Sobre */}
          <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F1] text-[#425C59] shadow-sm ring-1 ring-[#425C59]/10">
                📄
              </div>

              <h3 className="text-lg font-bold text-black">Sobre a obra</h3>
            </div>

            <p className="text-sm leading-7 text-black/70">{obra.descricao}</p>

            <p className="mt-4 text-sm leading-7 text-black/70">
              {obra.detalhes}
            </p>
          </div>

          {/* Etapas */}
          <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5">
            <h3 className="mb-5 text-lg font-bold text-black">
              Etapas da obra
            </h3>

            <div className="space-y-5">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC222] text-sm font-bold text-white">
                  ✓
                </span>

                <div>
                  <p className="font-semibold text-black">
                    Planejamento e projeto
                  </p>
                  <p className="text-sm text-black/60">
                    Concluída em 10/02/2026
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FFC222] text-sm font-bold text-white">
                  ✓
                </span>

                <div>
                  <p className="font-semibold text-black">
                    Licitação e contratação
                  </p>
                  <p className="text-sm text-black/60">
                    Concluída em 01/03/2026
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-4 border-[#FFC222] bg-white"></span>

                <div>
                  <p className="font-semibold text-black">Execução da obra</p>
                  <p className="text-sm text-black/60">{obra.status}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border-4 border-zinc-300 bg-white"></span>

                <div>
                  <p className="font-semibold text-black">
                    Conclusão e entrega
                  </p>
                  <p className="text-sm text-black/60">
                    Previsto para {obra.prazo}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F1] text-[#425C59] shadow-sm ring-1 ring-[#425C59]/10">
                📍
              </div>

              <h3 className="text-lg font-bold text-black">Localização</h3>
            </div>

            <div className="flex h-40 items-center justify-center rounded-2xl bg-[#E3F1F1] text-center text-sm text-black/60">
              Mapa ilustrativo da obra
              <br />
              {obra.local}
            </div>

            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-xl bg-[#CBDfde] px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-white"
            >
              Abrir no Google Maps ↗
            </a>
          </div>
        </section>

        {/* Segunda linha */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.65fr_0.8fr]">
          {/* Galeria */}
          <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F1] text-[#425C59] shadow-sm ring-1 ring-[#425C59]/10">
                📷
              </div>

              <h3 className="text-lg font-bold text-black">
                Galeria de atualizações
              </h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="relative h-28 overflow-hidden rounded-2xl bg-[#425C59]/20"
                >
                  <Image
                    src={obra.imagem}
                    alt={`Atualização ${item} da obra`}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <button className="mt-4 w-full rounded-xl bg-[#CBDfde] px-4 py-3 text-sm font-semibold text-black transition hover:bg-white">
              Ver todas as fotos
            </button>
          </div>

          {/* Transparência */}
          <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F1] text-[#425C59] shadow-sm ring-1 ring-[#425C59]/10">
                🛡️
              </div>

              <h3 className="text-lg font-bold text-black">Transparência</h3>
            </div>

            <div className="space-y-4 text-sm text-black/70">
              <div>
                <p className="font-semibold text-black">Órgão responsável</p>
                <p>{obra.orgao}</p>
              </div>

              <div>
                <p className="font-semibold text-black">Empresa executora</p>
                <p>{obra.empresa}</p>
              </div>

              <div>
                <p className="font-semibold text-black">Última atualização</p>
                <p>{obra.ultimaAtualizacao}</p>
              </div>
            </div>
          </div>

          {/* Participar */}
          <div className="rounded-3xl bg-white/80 p-6 shadow-xl ring-1 ring-black/5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3F1F1] text-[#425C59] shadow-sm ring-1 ring-[#425C59]/10">
                👥
              </div>

              <h3 className="text-lg font-bold text-black">
                Acompanhe e participe
              </h3>
            </div>

            <p className="text-sm leading-7 text-black/70">
              Receba atualizações sobre o andamento desta obra e contribua com
              observações da comunidade.
            </p>

            <button className="mt-5 w-full rounded-xl bg-[#FFC222] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#eab308]">
              Acompanhar atualizações 🔔
            </button>

            <button className="mt-3 w-full rounded-xl border border-black/20 px-4 py-3 text-sm font-semibold text-black transition hover:bg-black/5">
              Registrar observação 💬
            </button>
          </div>
        </section>

        <div className="mt-6 rounded-2xl border border-[#425C59]/20 bg-[#DFF0DF] px-5 py-4 text-sm text-[#425C59]">
          ℹ️ Transparência e participação cidadã constroem uma cidade melhor
          para todos.
        </div>
      </main>
    </div>
  );
}
