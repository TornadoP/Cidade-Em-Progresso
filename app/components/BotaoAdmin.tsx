"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function BotaoAdmin() {
  const [ehAdmin, setEhAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarAdmin() {
      try {
        const { data: sessao } = await supabase.auth.getSession();
        const token = sessao.session?.access_token;

        if (!token) {
          setEhAdmin(false);
          return;
        }

        const resposta = await fetch("/api/admin/verificar", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setEhAdmin(resposta.ok);
      } catch {
        setEhAdmin(false);
      } finally {
        setCarregando(false);
      }
    }

    verificarAdmin();
  }, []);

  if (carregando || !ehAdmin) {
    return null;
  }

  return (
    <Link
      href="/rotas/admin"
      title="Painel administrativo"
      aria-label="Painel administrativo"
      className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-[#425C59] text-xl text-white shadow-xl transition hover:scale-105 hover:bg-[#314744]"
    >
      ⚙️
    </Link>
  );
}
