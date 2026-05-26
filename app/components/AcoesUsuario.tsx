"use client";

import BotaoUsuario from "@/app/components/BotaoUsuario";

export default function AcoesUsuario() {
  function sair() {
    localStorage.removeItem("cidade_progresso_usuario_uuid");
    localStorage.removeItem("cidade_progresso_usuario_nome");

    window.location.reload();
  }

  return (
    <div className="flex items-center gap-3">
      <BotaoUsuario />

      <button
        type="button"
        aria-label="Sair da conta"
        onClick={sair}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shadow-sm transition hover:scale-105 hover:bg-red-200"
        title="Sair da conta"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-red-700"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18 15l3-3m0 0l-3-3m3 3H9"
          />
        </svg>
      </button>
    </div>
  );
}
