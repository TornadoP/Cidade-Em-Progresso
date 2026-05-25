import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

type ObraRanking = {
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

export const dynamic = "force-dynamic";

function corPosicao(posicao: number) {
  if (posicao === 1) {
    return "bg-[#FFC222] text-black";
  }

  if (posicao === 2) {
    return "bg-zinc-300 text-black";
  }

  if (posicao === 3) {
    return "bg-orange-300 text-black";
  }

  return "bg-[#425C59] text-white";
}

export default async function RankingPage() {
  const { data: obras, error } = await supabase
    .from("obras_com_votos")
    .select("*")
    .neq("status", "Concluída")
    .order("total_votos", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-6 font-sans">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-xl font-bold text-black">
            Erro ao carregar ranking
          </h1>

          <p className="mt-2 text-sm text-black/70">{error.message}</p>
        </div>
      </div>
    );
  }

  const obrasRanking = (obras || []) as ObraRanking[];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="w-full max-w-6xl overflow-hidden rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Cidade em Progresso
            </h1>

            <p className="mt-2 text-sm text-black/70">
              Ranking de prioridades populares
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
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
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
              className="rounded-xl bg-[#FFC222] px-4 py-3 font-medium text-black transition hover:bg-[#eab308]"
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

        <section className="rounded-3xl bg-[#425C59] p-5 text-white shadow-xl">
          <div className="mb-6 flex flex-col gap-2">
            <h2 className="text-2xl font-bold">Obras mais votadas</h2>

            <p className="text-sm text-white/80">
              Este ranking mostra as obras em planejamento ou andamento com
              maior apoio popular. Obras concluídas ficam fora do ranking de
              prioridade.
            </p>
          </div>

          {obrasRanking.length === 0 ? (
            <div className="rounded-2xl bg-white/10 p-5 text-sm text-white/80">
              Nenhuma obra disponível para o ranking no momento.
            </div>
          ) : (
            <div className="space-y-4">
              {obrasRanking.map((obra, index) => {
                const posicao = index + 1;
                const totalVotos = Number(obra.total_votos || 0);

                return (
                  <Link
                    key={obra.id}
                    href={`/rotas/obras/${obra.fonte_id || obra.id}`}
                    className="grid gap-4 rounded-2xl bg-white p-4 text-black shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:grid-cols-[70px_120px_1fr_auto]"
                  >
                    <div className="flex items-center justify-center">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold ${corPosicao(
                          posicao,
                        )}`}
                      >
                        {posicao}º
                      </span>
                    </div>

                    <div className="relative h-24 overflow-hidden rounded-2xl bg-[#425C59]/20">
                      <Image
                        src={obra.imagem || "/obra-principal.png"}
                        alt={obra.titulo}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-center">
                      <h3 className="text-lg font-bold">{obra.titulo}</h3>

                      <p className="mt-1 text-sm text-black/70">
                        📍 {obra.local || "Local não informado"}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-[#E3F1F1] px-3 py-1 font-semibold text-[#425C59]">
                          {obra.status || "Em planejamento"}
                        </span>

                        <span className="rounded-full bg-[#E3F1F1] px-3 py-1 font-semibold text-[#425C59]">
                          {obra.tipo || "Tipo não informado"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-start md:justify-end">
                      <div className="rounded-2xl bg-[#FFC222] px-5 py-3 text-center font-bold text-black shadow-sm">
                        🗳️ {totalVotos} voto{totalVotos === 1 ? "" : "s"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
