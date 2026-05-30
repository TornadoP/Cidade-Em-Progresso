import { supabase } from "@/app/lib/supabaseClient";
import FormUploadImagemObra from "@/app/components/FormUploadImagemObra";

export const dynamic = "force-dynamic";

export default async function ImagensObrasAdminPage() {
  const { data: obras, error } = await supabase
    .from("obras")
    .select("id, titulo, fonte_id, origem, tipo, status")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[#E3F1F1] p-6">
        <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-2xl font-bold text-black">
            Enviar fotos das obras
          </h1>

          <p className="mt-4 text-red-600">
            Erro ao carregar obras: {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#E3F1F1] p-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 shadow-xl">
        <h1 className="text-2xl font-bold text-black">
          Enviar fotos das obras
        </h1>

        <p className="mt-2 text-sm leading-6 text-black/60">
          Use esta area para adicionar fotos reais as paginas de detalhes das
          obras. As imagens enviadas aparecerao na galeria da obra selecionada.
        </p>

        <div className="mt-6">
          <FormUploadImagemObra obras={obras || []} />
        </div>
      </div>
    </main>
  );
}
