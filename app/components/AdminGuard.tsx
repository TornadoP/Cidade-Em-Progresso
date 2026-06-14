"use client";

import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

type Props = {
  children: ReactNode;
};

export default function AdminGuard({ children }: Props) {
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const verificarAdmin = useCallback(async (mostrarCarregando = false) => {
    if (mostrarCarregando) {
      setCarregando(true);
    }

    try {
      const { data: usuarioData } = await supabase.auth.getUser();
      const usuario = usuarioData.user;

      setEmail(usuario?.email || null);

      if (!usuario?.email) {
        setAutorizado(false);
        return;
      }

      const { data: sessaoData } = await supabase.auth.getSession();
      const token = sessaoData.session?.access_token;

      if (!token) {
        setAutorizado(false);
        return;
      }

      const resposta = await fetch("/api/admin/verificar", {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAutorizado(resposta.ok);
    } catch {
      setAutorizado(false);
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

  useEffect(() => {
    if (!autorizado) {
      return;
    }

    function verificarAoVoltar() {
      void verificarAdmin();
    }

    window.addEventListener("pageshow", verificarAoVoltar);

    return () => {
      window.removeEventListener("pageshow", verificarAoVoltar);
    };
  }, [autorizado, verificarAdmin]);

  async function tentarNovamente() {
    await verificarAdmin(true);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[#E3F1F1] p-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
          <p className="text-sm text-black/70">Verificando acesso...</p>
        </div>
      </main>
    );
  }

  if (!autorizado) {
    return (
      <main className="min-h-screen bg-[#E3F1F1] p-6">
        <div className="mx-auto max-w-3xl rounded-3xl bg-white p-6 shadow-xl">
          <h1 className="text-2xl font-bold text-black">Acesso restrito</h1>

          <p className="mt-3 text-sm leading-7 text-black/70">
            Esta área é exclusiva para administradores autorizados.
          </p>

          {email && (
            <p className="mt-3 text-sm text-black/60">
              Usuário logado: <strong>{email}</strong>
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={tentarNovamente}
              className="rounded-xl bg-[#425C59] px-5 py-3 text-sm font-bold text-white"
            >
              Verificar novamente
            </button>

            <Link
              href="/rotas/login?voltar=/rotas/admin"
              className="rounded-xl bg-[#FFC222] px-5 py-3 text-sm font-bold text-black"
            >
              Ir para login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
