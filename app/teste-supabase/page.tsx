import { supabase } from "@/app/lib/supabaseClient";

export default async function TesteSupabasePage() {
  const { data: obras, error } = await supabase.from("obras").select("*");

  if (error) {
    return (
      <div className="p-10">
        <h1>Erro ao buscar obras</h1>
        <pre>{error.message}</pre>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="mb-4 text-2xl font-bold">Teste Supabase Funcionando</h1>

      <pre>{JSON.stringify(obras, null, 2)}</pre>
    </div>
  );
}
