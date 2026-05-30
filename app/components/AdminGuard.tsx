"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/app/lib/supabaseClient";

type Props = {
  children: ReactNode;
};

export default function AdminGuard({ children }: Props) {
  const [carregando, setCarregando] = useState(true);
  const [autorizado, setAutorizado] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function verificarAdmin() {
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
    }

    verificarAdmin();
  }, []);

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

          <Link
            href="/rotas/login?voltar=/rotas/admin"
            className="mt-5 inline-flex rounded-xl bg-[#FFC222] px-5 py-3 text-sm font-bold text-black"
          >
            Ir para login
          </Link>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
