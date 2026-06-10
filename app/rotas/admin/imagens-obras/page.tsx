import { supabase } from "@/app/lib/supabaseClient";
import FormUploadImagemObra from "@/app/components/FormUploadImagemObra";
import AdminGuard from "@/app/components/AdminGuard";
import AdminNavegacao from "@/app/components/AdminNavegacao";

export const dynamic = "force-dynamic";

export default async function ImagensObrasAdminPage() {
  const { data: obras, error } = await supabase
    .from("obras")
    .select("id, titulo, fonte_id, origem, tipo, status")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <AdminGuard>
        <main className="min-h-screen bg-[#E3F1F1] p-6">
          <div className="mx-auto max-w-4xl">
            <AdminNavegacao titulo="Enviar imagens das obras" />

            <div className="rounded-3xl bg-white p-6 shadow-xl">
              <p className="text-red-600">
                Erro ao carregar obras: {error.message}
              </p>
            </div>
          </div>
        </main>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <main className="min-h-screen bg-[#E3F1F1] p-6">
        <div className="mx-auto max-w-4xl">
          <AdminNavegacao titulo="Enviar imagens das obras" />

          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <p className="text-sm leading-6 text-black/60">
              Use esta área para adicionar fotos reais às páginas de detalhes
              das obras. As imagens enviadas aparecerão na galeria da obra
              selecionada.
            </p>

            <div className="mt-6">
              <FormUploadImagemObra obras={obras || []} />
            </div>
          </div>
        </div>
      </main>
    </AdminGuard>
  );
}
