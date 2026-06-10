"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type AdminFixo = {
  email: string;
  tipo: "fixo";
  removivel: false;
};

type AdminDinamico = {
  id: string;
  email: string;
  created_at: string;
  tipo: "dinamico";
  removivel: true;
};

type AdminItem = AdminFixo | AdminDinamico;

async function obterToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
}

export default function GerenciarAdmins() {
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const carregarAdmins = useCallback(async () => {
    const token = await obterToken();

    if (!token) {
      setErro("Sua sessão expirou. Faça login novamente.");
      return;
    }

    const resposta = await fetch("/api/admin/usuarios-admin", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      setErro(dados.erro || "Erro ao carregar administradores.");
      return;
    }

    setAdmins([...(dados.admins_fixos || []), ...(dados.admins_dinamicos || [])]);
  }, []);

  async function adicionarAdmin() {
    setCarregando(true);
    setErro("");
    setMensagem("");

    try {
      const token = await obterToken();

      if (!token) {
        setErro("Sua sessão expirou. Faça login novamente.");
        return;
      }

      const resposta = await fetch("/api/admin/usuarios-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao adicionar administrador.");
        return;
      }

      setMensagem("Administrador adicionado com sucesso.");
      setEmail("");
      await carregarAdmins();
    } catch {
      setErro("Erro inesperado ao adicionar administrador.");
    } finally {
      setCarregando(false);
    }
  }

  async function removerAdmin(admin: AdminDinamico) {
    const confirmar = window.confirm(`Remover acesso admin de ${admin.email}?`);

    if (!confirmar) return;

    setCarregando(true);
    setErro("");
    setMensagem("");

    try {
      const token = await obterToken();

      if (!token) {
        setErro("Sua sessão expirou. Faça login novamente.");
        return;
      }

      const resposta = await fetch(`/api/admin/usuarios-admin/${admin.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Erro ao remover administrador.");
        return;
      }

      setMensagem("Administrador removido com sucesso.");
      await carregarAdmins();
    } catch {
      setErro("Erro inesperado ao remover administrador.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void carregarAdmins();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [carregarAdmins]);

  return (
    <section className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
      <div className="mb-5">
        <h2 className="text-xl font-black text-black">
          Gerenciar administradores
        </h2>

        <p className="mt-2 text-sm leading-6 text-black/70">
          Adicione ou remova contas com acesso ao painel admin. Administradores
          fixos configurados no sistema não podem ser removidos por aqui.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          placeholder="email@exemplo.com"
          className="h-12 flex-1 rounded-2xl border border-black/10 bg-white px-4 text-sm font-semibold text-black outline-none transition focus:border-[#425C59] focus:ring-2 focus:ring-[#425C59]/20"
        />

        <button
          type="button"
          onClick={adicionarAdmin}
          disabled={carregando || !email.trim()}
          className="h-12 rounded-2xl bg-[#425C59] px-6 text-sm font-black text-white transition hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {carregando ? "Salvando..." : "Adicionar admin"}
        </button>
      </div>

      {mensagem && (
        <div className="mt-4 rounded-2xl bg-green-100 px-4 py-3 text-sm font-bold text-green-700">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mt-4 rounded-2xl bg-red-100 px-4 py-3 text-sm font-bold text-red-700">
          {erro}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {admins.length === 0 ? (
          <p className="text-sm text-black/60">
            Nenhum administrador encontrado.
          </p>
        ) : (
          admins.map((admin) => (
            <div
              key={admin.tipo === "fixo" ? admin.email : admin.id}
              className="flex flex-col gap-3 rounded-2xl bg-[#E3F1F1] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-black text-black">{admin.email}</p>

                <p className="mt-1 text-xs font-bold text-black/60">
                  {admin.tipo === "fixo"
                    ? "Admin fixo do sistema"
                    : "Admin adicionado pelo painel"}
                </p>
              </div>

              {admin.removivel ? (
                <button
                  type="button"
                  onClick={() => removerAdmin(admin)}
                  disabled={carregando}
                  className="rounded-xl bg-red-100 px-4 py-2 text-xs font-black text-red-700 transition hover:bg-red-200 disabled:opacity-60"
                >
                  Remover acesso
                </button>
              ) : (
                <span className="rounded-xl bg-blue-100 px-4 py-2 text-xs font-black text-blue-700">
                  Protegido
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
