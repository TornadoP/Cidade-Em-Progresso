import Image from "next/image";

// altere a cor em volta dos quadrados no lado esquerdo e deixe na mesma cor do card do centro

// Aqui é o código para o sistema funcionar, não mexa aqui
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] font-sans p-6">
      <main className="flex min-h-[850px] w-full max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-b from-[#F3EAE2] to-[#E0D1D4] shadow-2xl">
        {/* SIDEBAR ESQUERDA - a cor #4B3348 é um tom de roxo, ou lilas */}
        <aside className="flex w-64 flex-col bg-[#EFE7E2] px-5 py-6 text-[#4B3348]">
          <h1 className="mb-8 text-xl font-semibold">Cidade em Progresso</h1>

          <nav className="flex flex-col gap-3 text-sm">
            <a
              className="rounded-xl bg-[#D8CBD4] px-4 py-3 font-medium"
              href="#"
            >
              Inicio
            </a>

            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#D8CBD4]"
              href="#"
            >
              Obras
            </a>

            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#D8CBD4]"
              href="#"
            >
              Participar
            </a>

            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#D8CBD4]"
              href="#"
            >
              Ranking
            </a>

            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#D8CBD4]"
              href="#"
            >
              Sobre
            </a>
          </nav>
        </aside>
        {/* ÁREA PRINCIPAL DA DIREITA */}
        <section className="flex flex-1 flex-col px-10 py-8">
          {/* Barra de pesquisa */}
          <div className="mb-8 flex w-full justify-end">
            <div className="flex w-[320px] items-center gap-3 rounded-full border border-zinc-300 bg-white/70 px-4 py-2 shadow-sm backdrop-blur-sm">
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
                className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>
          {/* Card central com imagem e descrição */}
          <div className="flex flex-1 items-center-top justify-center">
            <div className="w-[520px] rounded-3xl bg-[#4B3348]/50 p-5 shadow-xl">
              {/* Área da imagem */}
              <div className="flex h-[260px] w-full items-center justify-center rounded-2xl bg-white/20">
                <span className="text-sm text-white/70">Imagem aqui</span>
              </div>

              {/* Área da descrição */}
              <div className="mt-5 rounded-2xl bg-white/10 p-4">
                <h2 className="text-xl font-semibold text-white">
                  Título da obra
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/80">
                  Aqui você pode colocar uma descrição sobre a obra, andamento,
                  localização ou informações importantes para o cidadão.
                </p>
              </div>
            </div>
          </div>

          {/* Daqui para baixo fica o resto do seu conteúdo */}
        </section>
        {/* Quadrados Verticais */}
        <div className="my-8 mr-8 self-start rounded-3xl border border-white/20 bg-black/10 p-6 shadow-xl">
          <div className="flex  flex-col gap-6 ">
            <div className="h-50 w-50 rounded-lg border border-zinc-300 bg-white"></div>
            <div className="h-50 w-50 rounded-lg border border-zinc-300 bg-white"></div>
            <div className="h-50 w-50 rounded-lg border border-zinc-300 bg-white"></div>
          </div>
        </div>
        ;
      </main>
    </div>
  );
}
