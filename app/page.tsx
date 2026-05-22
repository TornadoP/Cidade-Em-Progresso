"use client";

import Image from "next/image";

// Aqui é o código para o sistema funcionar, não mexa aqui comece após o main
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="flex w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#C9D9DB] shadow-[0_25px_80px_rgba(0,0,0,0.45)] md:min-h-[650px] md:flex-row">
        {/* SIDEBAR ESQUERDA - a cor #CBDfde é #D8CBD4 um tom de roxo, ou lilas  #4B5563 #425C59  #C9D9DB*/}
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
                <div className="flex h-[260px] w-full items-center justify-center rounded-2xl bg-white/20 sm:h-[320px] md:h-[360px]">
                  <span className="text-sm text-white/70">Imagem aqui</span>
                </div>

                {/* Área da descrição */}
                <div className="mt-5 min-h-[160px] rounded-2xl bg-white/10 p-4 md:h-[200px]">
                  <h2 className="text-xl font-semibold text-white">
                    Título da obra
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-white/80">
                    Aqui você pode colocar uma descrição sobre a obra,
                    andamento, localização ou informações importantes para o
                    cidadão.
                  </p>
                </div>
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

                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="4"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#c01616"
                          strokeWidth="4"
                          strokeDasharray="70 100"
                          strokeLinecap="round"
                        />
                      </svg>

                      <span className="absolute text-sm font-semibold text-black">
                        70%
                      </span>
                    </div>
                  </div>

                  {/* Gráfico 2 */}
                  <div className="flex h-[160px] min-w-[160px] flex-col items-center justify-center rounded-lg bg-white lg:h-auto lg:min-w-0 lg:flex-1">
                    <p className="mb-2 text-sm font-medium text-black">
                      Rua João Pessoa
                    </p>

                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="4"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#22C55E"
                          strokeWidth="4"
                          strokeDasharray="45 100"
                          strokeLinecap="round"
                        />
                      </svg>

                      <span className="absolute text-sm font-semibold text-black">
                        45%
                      </span>
                    </div>
                  </div>

                  {/* Gráfico 3 */}
                  <div className="flex h-[160px] min-w-[160px] flex-col items-center justify-center rounded-lg bg-white lg:h-auto lg:min-w-0 lg:flex-1">
                    <p className="mb-2 text-sm font-medium text-black">
                      Rua do Ifma de terra
                    </p>

                    <div className="relative flex h-20 w-20 items-center justify-center">
                      <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="4"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="4"
                          strokeDasharray="85 100"
                          strokeLinecap="round"
                        />
                      </svg>

                      <span className="absolute text-sm font-semibold text-black">
                        85%
                      </span>
                    </div>
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
