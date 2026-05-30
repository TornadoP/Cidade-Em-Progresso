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
          method: "GET",
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      verificarAdmin();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (carregando || !ehAdmin) {
    return null;
  }

  return (
    <Link
      href="/rotas/admin"
      title="Painel administrativo"
      aria-label="Painel administrativo"
      className="inline-flex items-center justify-center rounded-xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#314744]"
    >
      ⚙️ Admin
    </Link>
  );
}
