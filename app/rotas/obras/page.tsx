import { supabase } from "@/app/lib/supabaseClient";
import ObrasClient from "./ObrasClient";

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: Promise<{ pesquisa?: string }>;
}) {
  const params = await searchParams;

  const { data: obras, error } = await supabase
    .from("obras")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-6 font-sans">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-xl font-bold text-black">
            Erro ao carregar obras
          </h1>

          <p className="mt-2 text-sm text-black/70">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <ObrasClient obras={obras || []} pesquisaInicial={params.pesquisa || ""} />
  );
}
