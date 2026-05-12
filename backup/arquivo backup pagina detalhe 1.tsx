"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-white font-sans">
      {/* HEADER */}
      <header className="w-full flex justify-between items-center px-8 py-4 bg-white dark:bg-black border-b">
        <h1 className="text-white-600 font-bold text-xl">
          ✔ Cidade em Progresso
        </h1>
        {/* MENU */}
        <nav className="flex items-center space-x-6 text-zinc-700 dark:text-zinc-300">
          <button
            onClick={() => router.back()}
            className="bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-4 py-2 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors font-medium"
          >
            Início
          </button>
          <a href="#">Obras</a>
          <a href="#">Participar</a>
          <a href="#">Ranking</a>
          <a href="#">Sobre</a>
        </nav>
      </header>

      {/* MAIN */}
      <main className="flex flex-1 w-full max-w-10x2 mx-auto flex-col py-10 px-6">
        {/* TÍTULO */}
        <h2 className="text-2xl font-semibold mb-6 text-black dark:text-black">
          Obra ESBURACAMENTO DE RUAS
        </h2>

        {/* CARD PRINCIPAL */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-12 flex flex-col md:flex-row gap-6">
          <img
            src="https://www.pedreiras.ma.gov.br/fotos/738/Img0_600x400.jpg"
            alt="Praça"
            width={600}
            height={450}
          />

          <div className="flex-1">
            <p className="text-m text-white mb-4 ">
              📍 Endereço: RUA MANECO REGO 123{" "}
            </p>

            {/* PROGRESS BAR */}
            <div className="w-full bg-zinc-500 dark:bg-white h-3 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[72%]" />
            </div>

            <p className="mt-2 font-semibold text-black dark:text-white">
              72% CONCLUÍDO
            </p>

            <div className="flex flex-col gap-2 text-m text-white dark:text-white mt-2">
              <span>💰 Investimento: R$ 2.450.000</span>
              <span>📅Início: 01/01/2026</span>
              <span>📅Previsão de Conclusão: 01/01/2027</span>
              <br />
              <div className="flex flex-col gap-2 text-m text-white dark:text-white mt-2">
                <span>Descrição:</span>
                <span>
                  {" "}
                  Destruir completamente as ruas, até que não sobre mais
                  asfalto, taca uma bomba logo, até que não sobre mais nada não
                  precisa ter rua, só lama já serve
                </span>
                <span>
                  Pode adicionar aqui, especificações, ou observações
                  atualizadas da obra após 3 ou 6 meses de obra, ou +50% da
                  conclusão da mesma, se houve reorçamento da obra
                </span>
                <span>
                  O orçamento da obra e auditoria deve ser possivel ser
                  observado pelo povo, de maneira clara objetiva e transparente
                  assim possibilitanto que veja quanto foi gasto em tal material
                </span>
                <span>
                  tendo a possibilidade do povo conferir antes de um item ter o
                  inicio, já no seu orçamento, por exemplo, no caso de um
                  asfalto, se vai retirar o antigo antes, ou se vai fazer por
                  cima, se vai usar concreto junto ou primeiro por baixo, assim
                  custando mais, porém sendo o que o povo exigiu
                </span>
              </div>
            </div>
            <Link href="/obras/1">
              <button className="mt-4 bg-blue-500 text-white px-65 py-8 rounded-md hover:bg-blue-600">
                VOTAR
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
