import AdminGuard from "@/app/components/AdminGuard";
import AdminNavegacao from "@/app/components/AdminNavegacao";
import AdminObrasClient from "@/app/components/AdminObrasClient";
import { supabase } from "@/app/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function AdminObrasPage() {
  const { data: obras, error } = await supabase
    .from("obras")
    .select(
      "id, fonte_id, titulo, local, investimento, inicio, prazo, progresso, status, tipo, imagem, descricao, orgao, empresa, ultima_atualizacao, origem",
    )
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#E3F1F1] p-6">
        <div className="mx-auto max-w-7xl">
          <AdminNavegacao titulo="Gerenciar obras" />

          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-sm leading-7 text-black/60">
              Revise e ajuste os dados exibidos no site público.
            </p>

            {error ? (
              <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                Erro ao carregar obras: {error.message}
              </p>
            ) : (
              <AdminObrasClient obras={obras || []} />
            )}
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
