"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type AdminNavegacaoProps = {
  titulo?: string;
  mostrarVoltar?: boolean;
};

export default function AdminNavegacao({
  titulo = "Painel Admin",
  mostrarVoltar = true,
}: AdminNavegacaoProps) {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-white/80 p-4 shadow-lg ring-1 ring-black/5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#425C59]">
          Área administrativa
        </p>

        <h1 className="mt-1 text-2xl font-black text-black">{titulo}</h1>
      </div>

      <div className="flex flex-wrap gap-3">
        {mostrarVoltar && (
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-2xl bg-[#E3F1F1] px-5 py-3 text-sm font-black text-[#425C59] transition hover:bg-[#d4e7e7]"
          >
            ← Voltar
          </button>
        )}

        <Link
          href="/"
          className="rounded-2xl bg-white px-5 py-3 text-sm font-black text-black shadow-sm ring-1 ring-black/10 transition hover:bg-zinc-50"
        >
          Início
        </Link>

        <Link
          href="/rotas/admin"
          className="rounded-2xl bg-[#425C59] px-5 py-3 text-sm font-black text-white transition hover:bg-[#334846]"
        >
          Painel Admin
        </Link>
      </div>
    </div>
  );
}
