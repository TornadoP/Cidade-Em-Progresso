import Link from "next/link";
import AcoesUsuario from "@/app/components/AcoesUsuario";

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="mx-auto w-full max-w-6xl rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Sobre o Projeto</h1>

            <p className="mt-2 text-sm text-black/70">
              Entenda como funciona o Cidade em Progresso.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AcoesUsuario />

            <nav className="flex flex-wrap gap-3 text-sm">
              <Link
                href="/"
                className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#E3F1F1]"
              >
                Início
              </Link>

              <Link
                href="/rotas/obras"
                className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#E3F1F1]"
              >
                Obras
              </Link>

              <Link
                href="/rotas/participar"
                className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#E3F1F1]"
              >
                Participar
              </Link>

              <Link
                href="/rotas/ranking"
                className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#E3F1F1]"
              >
                Ranking
              </Link>

              <Link
                href="/rotas/sobre"
                className="rounded-xl bg-[#425C59] px-4 py-3 font-medium text-white transition hover:bg-[#334846]"
              >
                Sobre
              </Link>
            </nav>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
            <h2 className="text-xl font-bold text-black">
              O que é o Cidade em Progresso?
            </h2>

            <p className="mt-3 text-sm leading-7 text-black/70">
              O Cidade em Progresso é um projeto de plataforma cidadã para
              acompanhar obras públicas de forma simples, visual e
              participativa. A ideia é permitir que a população veja quais obras
              estão planejadas, em andamento ou concluídas, acompanhe o
              progresso e ajude a indicar quais obras devem receber mais
              atenção.
            </p>
          </div>

          <div className="rounded-3xl bg-[#425C59] p-6 text-white shadow-xl">
            <h2 className="text-xl font-bold">Como funciona a participação?</h2>

            <p className="mt-3 text-sm leading-7 text-white/80">
              Cada cidadão cadastrado pode apoiar até 5 obras ativas ao mesmo
              tempo. Quando uma obra é concluída, o voto continua registrado no
              histórico, mas deixa de ocupar uma vaga ativa. Assim, o cidadão
              pode apoiar uma nova obra.
            </p>
          </div>

          <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
            <h2 className="text-xl font-bold text-black">
              Ranking de Prioridade Popular
            </h2>

            <p className="mt-3 text-sm leading-7 text-black/70">
              O ranking não considera apenas a quantidade de votos. Ele combina
              votos ativos, pessoas beneficiadas, impacto social e urgência para
              criar uma pontuação de prioridade. Assim, uma obra importante para
              muitas pessoas pode se destacar mesmo que tenha menos votos que
              outra obra menor.
            </p>
          </div>

          <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
            <h2 className="text-xl font-bold text-black">
              Critérios usados no ranking
            </h2>

            <div className="mt-4 space-y-3 text-sm text-black/70">
              <p>
                <strong className="text-black">40%</strong> — votos ativos da
                população
              </p>

              <p>
                <strong className="text-black">25%</strong> — quantidade de
                pessoas beneficiadas
              </p>

              <p>
                <strong className="text-black">25%</strong> — impacto social da
                obra
              </p>

              <p>
                <strong className="text-black">10%</strong> — urgência da obra
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
          <h2 className="text-xl font-bold text-black">
            Observação sobre o protótipo
          </h2>

          <p className="mt-3 text-sm leading-7 text-black/70">
            Esta versão ainda é um protótipo acadêmico. Atualmente, os dados das
            obras podem ser cadastrados manualmente no Supabase. Em uma versão
            futura, o sistema poderá se conectar a APIs públicas de obras, bases
            oficiais de transparência e sistemas de autenticação mais robustos.
          </p>
        </section>
      </main>
    </div>
  );
}
