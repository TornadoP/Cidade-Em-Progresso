import Link from "next/link";
import AdminGuard from "@/app/components/AdminGuard";
import BotaoImportarObras from "@/app/components/BotaoImportarObras";
import BotaoProcessarDocumentos from "@/app/components/BotaoProcessarDocumentos";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#E3F1F1] p-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-3xl font-bold text-black">
            Painel administrativo
          </h1>

          <p className="mt-2 text-sm leading-7 text-black/60">
            Área interna para revisar obras, corrigir dados importados e
            adicionar fotos reais.
          </p>

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <BotaoImportarObras />
            <BotaoProcessarDocumentos />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              href="/rotas/admin/imagens-obras"
              className="rounded-3xl border border-black/10 bg-[#F8FAFA] p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-black">
                Enviar fotos das obras
              </h2>

              <p className="mt-2 text-sm leading-7 text-black/60">
                Adicionar fotos reais às obras sem alterar os dados oficiais.
              </p>
            </Link>

            <Link
              href="/rotas/obras"
              className="rounded-3xl border border-black/10 bg-[#F8FAFA] p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-black">Ver site público</h2>

              <p className="mt-2 text-sm leading-7 text-black/60">
                Conferir como as obras aparecem para os cidadãos.
              </p>
            </Link>
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
