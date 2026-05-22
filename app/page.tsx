import Image from "next/image";

// Aqui é o código para o sistema funcionar, não mexa aqui comece após o main
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#C9D9DB] shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:min-h-[650px] md:flex-row">
        {/* SIDEBAR ESQUERDA - a cor #CBDfde é #D8CBD4 um tom de roxo, ou lilas  #4B5563 #425C59  #C9D9DB*/}
        <aside className="flex w-full flex-col bg-[#425C59]/35 px-5 py-6 text-black md:w-56">
          <h1 className="mb-6 text-center text-xl font-semibold md:text-left">
            Cidade em Progresso
          </h1>

          {/* logo */}
          <div className="mb-6 flex justify-center md:mb-8">
            <div className="relative h-28 w-28 overflow-hidden rounded-full bg-[#D9B8C4] md:h-36 md:w-36">
              <Image
                src="/logo.png"
                alt="Logo Cidade em Progresso"
                fill
                sizes="144px"
                className="object-cover"
              />
            </div>
          </div>

          <nav className="flex flex-wrap justify-center gap-3 text-sm md:flex-col md:justify-start">
            <a
              className="rounded-xl bg-[#CBDfde] px-4 py-3 font-medium"
              href="#"
            >
              Inicio
            </a>

            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#CBDfde]"
              href="#"
            >
              Obras
            </a>

            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#CBDfde]"
              href="#"
            >
              Participar
            </a>

            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#CBDfde]"
              href="#"
            >
              Ranking
            </a>

            <a
              className="rounded-xl px-4 py-3 transition hover:bg-[#CBDfde]"
              href="#"
            >
              Sobre
            </a>
          </nav>
        </aside>
        {/* ÁREA PRINCIPAL DA DIREITA */}
        <section className="flex flex-1 flex-col px-4 py-6 sm:px-6 md:px-10 md:py-8">
          {/* Barra de pesquisa */}
          <div className="mb-6 flex w-full justify-center md:mb-8 md:justify-start">
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
                className="w-full bg-transparent text-sm text-zinc-700 outline-none placeholder:text-zinc-400"
              />
            </div>
          </div>
          {/* Card central com imagem e descrição */}
          <div className="flex flex-1 items-stretch justify-center gap-8">
            <div className="w-full rounded-3xl bg-[#425C59] p-5 shadow-xl md:w-[420px]">
              {/* Área da imagem */}
              <div className="flex h-[260px] w-full items-center justify-center rounded-2xl bg-white/20 sm:h-[320px] md:h-[360px]">
                <span className="text-sm text-white/70">Imagem aqui</span>
              </div>

              {/* Área da descrição */}
              <div className="mt-5 min-h-[160px] rounded-2xl bg-white/10 p-4 md:h-[200px]">
                <h2 className="text-xl font-semibold text-white">
                  Título da obra
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/80">
                  Aqui você pode colocar uma descrição sobre a obra, andamento,
                  localização ou informações importantes para o cidadão.
                </p>
              </div>
            </div>
            {/* Quadrados Verticais */}
            <div className="grid w-full grid-cols-1 gap-5 rounded-3xl border border-white/10 bg-[#425C59] p-5 shadow-xl sm:grid-cols-3 md:flex md:w-[210px] md:flex-col md:justify-between">
              <div className="h-[160px] w-full rounded-lg border border-zinc-300 bg-white md:h-[180px]"></div>
              <div className="h-[160px] w-full rounded-lg border border-zinc-300 bg-white md:h-[180px]"></div>
              <div className="h-[160px] w-full rounded-lg border border-zinc-300 bg-white md:h-[180px]"></div>
            </div>
          </div>

          {/* Daqui para baixo fica o resto do seu conteúdo */}
        </section>
      </main>
    </div>
  );
}
