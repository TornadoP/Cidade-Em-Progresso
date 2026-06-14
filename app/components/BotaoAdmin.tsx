"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

export default function BotaoAdmin() {
  const [ehAdmin, setEhAdmin] = useState(false);
  const [carregando, setCarregando] = useState(true);

  const verificarAdmin = useCallback(async (mostrarCarregando = false) => {
    if (mostrarCarregando) {
      setCarregando(true);
    }

    try {
      const { data: sessao } = await supabase.auth.getSession();
      const token = sessao.session?.access_token;

      if (!token) {
        setEhAdmin(false);
        return;
      }

      const resposta = await fetch("/api/admin/verificar", {
        method: "GET",
        cache: "no-store",
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
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void verificarAdmin(true);
    }, 0);

    function verificarAoFocar() {
      void verificarAdmin();
    }

    function verificarAoVoltarParaAba() {
      if (document.visibilityState === "visible") {
        void verificarAdmin();
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void verificarAdmin();
    });

    window.addEventListener("focus", verificarAoFocar);
    document.addEventListener("visibilitychange", verificarAoVoltarParaAba);

    return () => {
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
      window.removeEventListener("focus", verificarAoFocar);
      document.removeEventListener("visibilitychange", verificarAoVoltarParaAba);
    };
  }, [verificarAdmin]);

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
