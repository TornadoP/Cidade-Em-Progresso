"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type ObraDoVoto = {
  id: string;
  fonte_id: string | null;
  titulo: string;
  local: string | null;
  status: string | null;
  progresso: string | null;
  tipo: string | null;
  imagem: string | null;
};

type Voto = {
  id: string;
  ativo: boolean;
  created_at: string;
  obras: ObraDoVoto | null;
};

type PerfilResposta = {
  usuario: {
    id: string;
    nome: string;
    telefone: string | null;
    email: string | null;
    created_at: string;
  };
  resumo: {
    limite_votos_ativos: number;
    votos_ativos: number;
    votos_restantes: number;
    total_votos: number;
  };
  votos: Voto[];
};

export default function PerfilPage() {
  const router = useRouter();

  const [perfil, setPerfil] = useState<PerfilResposta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mensagemAtualizacao, setMensagemAtualizacao] = useState("");
  const [erroAtualizacao, setErroAtualizacao] = useState("");
  const [atualizando, setAtualizando] = useState(false);

  const [novoEmail, setNovoEmail] = useState("");
  const [senhaAtualEmail, setSenhaAtualEmail] = useState("");
  const [mensagemEmail, setMensagemEmail] = useState("");
  const [erroEmail, setErroEmail] = useState("");
  const [atualizandoEmail, setAtualizandoEmail] = useState(false);

  const carregarPerfil = useCallback(async () => {
    setCarregando(true);
    setErro("");

    const usuarioUuid = localStorage.getItem("cidade_progresso_usuario_uuid");

    if (!usuarioUuid) {
      router.push("/rotas/login?voltar=/rotas/perfil");
      return;
    }

    const resposta = await fetch("/api/perfil", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        usuario_uuid: usuarioUuid,
      }),
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      localStorage.removeItem("cidade_progresso_usuario_uuid");
      localStorage.removeItem("cidade_progresso_usuario_nome");

      setErro(dados.erro || "Erro ao carregar perfil.");
      setCarregando(false);
      return;
    }

    setPerfil(dados);
    setCarregando(false);
    setPerfil(dados);
    setCarregando(false);
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      carregarPerfil();
    }, 0);

    return () => clearTimeout(timer);
  }, [carregarPerfil]);

  async function sair() {
    await supabase.auth.signOut();

    localStorage.removeItem("cidade_progresso_usuario_uuid");
    localStorage.removeItem("cidade_progresso_usuario_nome");

    router.push("/rotas/login");
  }

  async function atualizarSenhaAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagemAtualizacao("");
    setErroAtualizacao("");
    setAtualizando(true);

    if (!perfil?.usuario.email) {
      setErroAtualizacao("Não foi possível identificar o email da conta.");
      setAtualizando(false);
      return;
    }

    if (!senhaAtual.trim()) {
      setErroAtualizacao("Informe sua senha atual.");
      setAtualizando(false);
      return;
    }

    if (!novaSenha.trim() || !confirmarNovaSenha.trim()) {
      setErroAtualizacao("Informe a nova senha e a confirmação.");
      setAtualizando(false);
      return;
    }

    if (novaSenha.length < 6) {
      setErroAtualizacao("A nova senha precisa ter pelo menos 6 caracteres.");
      setAtualizando(false);
      return;
    }

    if (novaSenha !== confirmarNovaSenha) {
      setErroAtualizacao("A nova senha e a confirmação não conferem.");
      setAtualizando(false);
      return;
    }

    const { error: erroSenhaAtual } = await supabase.auth.signInWithPassword({
      email: perfil.usuario.email,
      password: senhaAtual,
    });

    if (erroSenhaAtual) {
      setErroAtualizacao("Senha atual incorreta.");
      setAtualizando(false);
      return;
    }

    const { error: erroAtualizarSenha } = await supabase.auth.updateUser({
      password: novaSenha,
    });

    if (erroAtualizarSenha) {
      setErroAtualizacao("Não foi possível atualizar a senha.");
      setAtualizando(false);
      return;
    }

    setMensagemAtualizacao("Senha atualizada com sucesso.");
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmarNovaSenha("");
    setAtualizando(false);
  }
  async function atualizarEmailAuth(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMensagemEmail("");
    setErroEmail("");
    setAtualizandoEmail(true);

    if (!perfil?.usuario.email) {
      setErroEmail("Não foi possível identificar o email atual da conta.");
      setAtualizandoEmail(false);
      return;
    }

    const emailAtual = perfil.usuario.email.trim().toLowerCase();
    const emailNovo = novoEmail.trim().toLowerCase();

    if (!emailNovo) {
      setErroEmail("Informe o novo email.");
      setAtualizandoEmail(false);
      return;
    }

    if (!senhaAtualEmail.trim()) {
      setErroEmail("Informe sua senha atual para confirmar a alteração.");
      setAtualizandoEmail(false);
      return;
    }

    if (emailNovo === emailAtual) {
      setErroEmail("O novo email precisa ser diferente do email atual.");
      setAtualizandoEmail(false);
      return;
    }

    const { error: erroSenhaAtual } = await supabase.auth.signInWithPassword({
      email: emailAtual,
      password: senhaAtualEmail,
    });

    if (erroSenhaAtual) {
      setErroEmail("Senha atual incorreta.");
      setAtualizandoEmail(false);
      return;
    }

    const { error: erroAtualizarEmail } = await supabase.auth.updateUser({
      email: emailNovo,
    });

    if (erroAtualizarEmail) {
      setErroEmail("Não foi possível solicitar a alteração de email.");
      setAtualizandoEmail(false);
      return;
    }

    setMensagemEmail(
      "Solicitação enviada. Confira seu email para confirmar a alteração.",
    );

    setNovoEmail("");
    setSenhaAtualEmail("");
    setAtualizandoEmail(false);
  }

  if (carregando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-6 font-sans">
        <main className="rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-black">
            Carregando perfil...
          </h1>
        </main>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-6 font-sans">
        <main className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-black">
            Não foi possível carregar o perfil
          </h1>

          <p className="mt-3 text-sm text-black/70">{erro}</p>

          <button
            type="button"
            onClick={() => router.push("/rotas/login")}
            className="mt-6 w-full rounded-2xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white"
          >
            Entrar novamente
          </button>
        </main>
      </div>
    );
  }

  if (!perfil) {
    return null;
  }

  const votosAtivos = perfil.votos.filter((voto) => voto.ativo);
  const votosHistoricos = perfil.votos.filter((voto) => !voto.ativo);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="mx-auto w-full max-w-6xl rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Perfil do Cidadão</h1>

            <p className="mt-2 text-sm text-black/70">
              Acompanhe seus votos ativos, histórico e dados da conta.
            </p>
          </div>

          <nav className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Início
            </Link>

            <Link
              href="/rotas/obras"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Obras
            </Link>

            <Link
              href="/rotas/ranking"
              className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#FFC222]"
            >
              Ranking
            </Link>

            <button
              type="button"
              onClick={sair}
              className="rounded-xl bg-red-100 px-4 py-3 font-medium text-red-700 transition hover:bg-red-200"
            >
              Sair
            </button>
          </nav>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl bg-[#425C59] p-6 text-white shadow-xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-3xl">
              👤
            </div>

            <h2 className="mt-5 text-2xl font-bold">{perfil.usuario.nome}</h2>

            <div className="mt-4 space-y-2 text-sm text-white/85">
              <p>
                <span className="font-semibold text-white">Email:</span>{" "}
                {perfil.usuario.email || "Não informado"}
              </p>

              <p>
                <span className="font-semibold text-white">Telefone:</span>{" "}
                {perfil.usuario.telefone || "Não informado"}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/70">Votos ativos usados</p>
                <p className="mt-1 text-3xl font-bold">
                  {perfil.resumo.votos_ativos}/
                  {perfil.resumo.limite_votos_ativos}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/70">Vagas restantes</p>
                <p className="mt-1 text-3xl font-bold">
                  {perfil.resumo.votos_restantes}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-sm text-white/70">Total histórico</p>
                <p className="mt-1 text-3xl font-bold">
                  {perfil.resumo.total_votos}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
              <h2 className="text-xl font-bold text-black">
                Segurança da conta
              </h2>

              <p className="mt-2 text-sm text-black/70">
                Atualize sua senha usando sua senha atual como confirmação de
                segurança.
              </p>

              <form onSubmit={atualizarSenhaAuth} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-black">
                    Senha atual
                  </label>

                  <input
                    type={mostrarNovaSenha ? "text" : "password"}
                    value={senhaAtual}
                    onChange={(event) => setSenhaAtual(event.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-black">
                    Nova senha
                  </label>

                  <input
                    type={mostrarNovaSenha ? "text" : "password"}
                    value={novaSenha}
                    onChange={(event) => setNovaSenha(event.target.value)}
                    placeholder="Nova senha com pelo menos 6 caracteres"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-black">
                    Confirmar nova senha
                  </label>

                  <input
                    type={mostrarNovaSenha ? "text" : "password"}
                    value={confirmarNovaSenha}
                    onChange={(event) =>
                      setConfirmarNovaSenha(event.target.value)
                    }
                    placeholder="Repita a nova senha"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMostrarNovaSenha((valorAtual) => !valorAtual)
                  }
                  className="text-sm font-semibold text-[#425C59] underline"
                >
                  {mostrarNovaSenha ? "Ocultar senhas" : "Mostrar senhas"}
                </button>

                {erroAtualizacao && (
                  <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
                    {erroAtualizacao}
                  </div>
                )}

                {mensagemAtualizacao && (
                  <div className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
                    {mensagemAtualizacao}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={atualizando}
                  className="w-full rounded-2xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {atualizando ? "Atualizando..." : "Atualizar senha"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
              <h2 className="text-xl font-bold text-black">Alterar email</h2>

              <p className="mt-2 text-sm text-black/70">
                Informe um novo email e confirme com sua senha atual. O Supabase
                poderá enviar uma confirmação para validar a alteração.
              </p>

              <form onSubmit={atualizarEmailAuth} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-black">
                    Email atual
                  </label>

                  <input
                    type="email"
                    value={perfil.usuario.email || ""}
                    disabled
                    className="w-full cursor-not-allowed rounded-2xl border border-black/10 bg-zinc-100 px-4 py-3 text-sm text-black/60 outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-black">
                    Novo email
                  </label>

                  <input
                    type="email"
                    value={novoEmail}
                    onChange={(event) => setNovoEmail(event.target.value)}
                    placeholder="novoemail@exemplo.com"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-black">
                    Senha atual
                  </label>

                  <input
                    type="password"
                    value={senhaAtualEmail}
                    onChange={(event) => setSenhaAtualEmail(event.target.value)}
                    placeholder="Digite sua senha atual"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                  />
                </div>

                {erroEmail && (
                  <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
                    {erroEmail}
                  </div>
                )}

                {mensagemEmail && (
                  <div className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
                    {mensagemEmail}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={atualizandoEmail}
                  className="w-full rounded-2xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {atualizandoEmail
                    ? "Enviando solicitação..."
                    : "Solicitar alteração de email"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
          <h2 className="text-xl font-bold text-black">Meus votos ativos</h2>

          <p className="mt-2 text-sm text-black/70">
            Estes votos contam para o ranking de prioridade popular.
          </p>

          {votosAtivos.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#E3F1F1] p-5 text-sm text-black/70">
              Você ainda não possui votos ativos.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {votosAtivos.map((voto) => (
                <Link
                  key={voto.id}
                  href={`/rotas/obras/${voto.obras?.fonte_id || voto.obras?.id}`}
                  className="flex gap-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#425C59]/20">
                    <Image
                      src={voto.obras?.imagem || "/obra-principal.png"}
                      alt={voto.obras?.titulo || "Obra votada"}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-black">
                      {voto.obras?.titulo || "Obra não encontrada"}
                    </h3>

                    <p className="mt-1 text-sm text-black/60">
                      {voto.obras?.status || "Status não informado"}
                    </p>

                    <p className="mt-1 text-xs text-black/50">
                      Votado em{" "}
                      {new Date(voto.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5">
          <h2 className="text-xl font-bold text-black">Histórico de votos</h2>

          <p className="mt-2 text-sm text-black/70">
            Votos de obras concluídas continuam registrados como histórico.
          </p>

          {votosHistoricos.length === 0 ? (
            <div className="mt-5 rounded-2xl bg-[#E3F1F1] p-5 text-sm text-black/70">
              Nenhum voto histórico no momento.
            </div>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {votosHistoricos.map((voto) => (
                <Link
                  key={voto.id}
                  href={`/rotas/obras/${voto.obras?.fonte_id || voto.obras?.id}`}
                  className="flex gap-4 rounded-2xl bg-white p-4 shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#425C59]/20">
                    <Image
                      src={voto.obras?.imagem || "/obra-principal.png"}
                      alt={voto.obras?.titulo || "Obra votada"}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-bold text-black">
                      {voto.obras?.titulo || "Obra não encontrada"}
                    </h3>

                    <p className="mt-1 text-sm text-black/60">
                      {voto.obras?.status || "Status não informado"}
                    </p>

                    <p className="mt-1 text-xs text-black/50">
                      Votado em{" "}
                      {new Date(voto.created_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
