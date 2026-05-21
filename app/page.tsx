import Image from "next/image";

// Aqui é o código para o sistema funcionar, não mexa aqui
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] font-sans p-6">
      <main className="flex min-h-[650px] w-full max-w-5xl flex-col items-center justify-between rounded-3xl bg-gradient-to-b from-[#F3EAE2] to-[#E0D1D4] px-16 py-10 shadow-2xl sm:items-start">
        {/* Aqui é o código para os quadrados de teste */}
        <div className="flex  flex-col gap-6 ml-auto">
          <div className="h-50 w-50 rounded-lg border border-zinc-300 bg-white"></div>
          <div className="h-50 w-50 rounded-lg border border-zinc-300 bg-white"></div>
          <div className="h-50 w-50 rounded-lg border border-zinc-300 bg-white"></div>
        </div>

        <div className="flex-1 py-10">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black">
            Que droga
          </h1>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black">
            To get started, edit the page.tsx file.
          </h1>

          <p className="max-w-md text-lg leading-8 text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-black"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a href="" className="font-medium text-black">
              Learning
            </a>{" "}
            center.
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-10 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-black transition-colors hover:bg-zinc-300 md:w-[158px]"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Startar Agora
          </a>

          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white px-5 text-black transition-colors hover:bg-zinc-300 md:w-[158px]"
            href=""
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentação
          </a>
        </div>
      </main>
    </div>
  );
}
