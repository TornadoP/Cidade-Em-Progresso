import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-white font-sans">
      {/* HEADER */}
      <header className="w-full flex justify-between items-center px-8 py-4 bg-white dark:bg-black border-b">
        <h1 className="text-white-600 font-bold text-xl">
          ✔ Cidade em Progresso
        </h1>

        <nav className="space-x-6 text-zinc-700 dark:text-zinc-300">
          <a href="#">Início</a>
          <a href="#">Obras</a>
          <a href="#">Participar</a>
          <a href="#">Ranking</a>
          <a href="#">Sobre</a>
        </nav>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 w-full max-w-5xl mx-auto flex-col py-10 px-6">
        {/* TÍTULO */}
        <h2 className="text-2xl font-semibold mb-6 text-black dark:text-white">
          Obras em andamento
        </h2>

        {/* CARD PRINCIPAL */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col md:flex-row gap-6">
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb"
            alt="Praça"
            width={400}
            height={250}
          />

          <div className="flex-1">
            <h3 className="text-xl font-semibold text-black dark:text-white">
              Esburacar mais as ruas
            </h3>

            <p className="text-zinc-500 mb-2">📍 Pedreiras e Região</p>

            {/* PROGRESS BAR */}
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-3 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[72%]" />
            </div>

            <p className="mt-2 font-semibold text-black dark:text-white">72%</p>

            <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              <span>💰 R$ 2.450.000</span>
              <span>📅 01/01/2026</span>
              <span>📅 01/01/2027</span>
            </div>

            <Link href="/obras/1">
              <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
                Ver detalhes
              </button>
            </Link>
          </div>
        </div>

        {/* OUTRAS OBRAS */}
        <h2 className="text-2xl font-semibold mt-10 mb-6 text-black dark:text-white">
          Outras obras
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CARD 1 */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow text-center">
            <p className="text-lg text-black dark:text-white">
              🏫 Escola Municipal
            </p>
            <p className="font-semibold mt-2 text-black dark:text-white">48%</p>

            <div className="bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full mt-2">
              <div className="bg-yellow-400 h-full w-[48%]" />
            </div>
          </div>

          {/* CARD 2 */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow text-center">
            <p className="text-lg text-black dark:text-white">🛣 Bairro Novo</p>
            <p className="font-semibold mt-2 text-black dark:text-white">33%</p>

            <div className="bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full mt-2">
              <div className="bg-yellow-400 h-full w-[33%]" />
            </div>
          </div>

          {/* CARD 3 */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow text-center">
            <p className="text-lg text-black dark:text-white">
              🏥 UPP pra trocação de tiro
            </p>
            <p className="font-semibold mt-2 text-black dark:text-white">20%</p>

            <div className="bg-zinc-200 dark:bg-zinc-700 h-2 rounded-full mt-2">
              <div className="bg-yellow-400 h-full w-[20%]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
