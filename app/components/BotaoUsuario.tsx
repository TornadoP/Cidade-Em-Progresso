"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function BotaoUsuario() {
  const [logado, setLogado] = useState(false);
  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const usuarioUuid = localStorage.getItem("cidade_progresso_usuario_uuid");

      const usuarioNome = localStorage.getItem("cidade_progresso_usuario_nome");

      setLogado(Boolean(usuarioUuid));
      setNome(usuarioNome || "");
      setCarregando(false);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (carregando) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-black shadow-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC222] text-base text-black shadow-sm ring-2 ring-white/70">
          👤
        </span>

        <span className="hidden sm:inline">Carregando...</span>
      </div>
    );
  }

  return (
    <Link
      href={logado ? "/rotas/perfil" : "/rotas/login"}
      className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-black shadow-sm transition hover:bg-[#FFC222]"
      title={logado ? "Abrir perfil" : "Entrar ou cadastrar"}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFC222] text-base text-black shadow-sm ring-2 ring-white/70">
        👤
      </span>

      <span className="hidden sm:inline">
        {logado ? nome || "Perfil" : "Entrar"}
      </span>
    </Link>
  );
}
