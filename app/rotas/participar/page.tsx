"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AcoesUsuario from "@/app/components/AcoesUsuario";

const categorias = [
  "Pavimentação",
  "Saúde",
  "Educação",
  "Iluminação",
  "Saneamento",
  "Drenagem",
  "Lazer",
  "Segurança",
  "Mobilidade",
  "Outro",
];

export default function ParticiparPage() {
  const router = useRouter();

  const [usuarioUuid, setUsuarioUuid] = useState("");

  const [titulo, setTitulo] = useState("");
  const [local, setLocal] = useState("");
  const [bairro, setBairro] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [justificativa, setJustificativa] = useState("");

  const [arquivoImagemPrincipal, setArquivoImagemPrincipal] =
    useState<File | null>(null);

  const [arquivosImagensExtras, setArquivosImagensExtras] = useState<File[]>(
    [],
  );

  const [arquivoVideo, setArquivoVideo] = useState<File | null>(null);
  const [enviandoArquivos, setEnviandoArquivos] = useState(false);

  const [etapasSugeridas, setEtapasSugeridas] = useState("");
  const [transparenciaInfo, setTransparenciaInfo] = useState("");
  const [orgaoSugerido, setOrgaoSugerido] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [verificandoLogin, setVerificandoLogin] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const usuarioSalvo = localStorage.getItem(
        "cidade_progresso_usuario_uuid",
      );

      if (!usuarioSalvo) {
        router.push("/rotas/login?voltar=/rotas/participar");
        return;
      }

      setUsuarioUuid(usuarioSalvo);
      setVerificandoLogin(false);
    }, 0);

    return () => clearTimeout(timer);
  }, [router]);

  async function enviarArquivoParaStorage(
    arquivo: File,
    tipo: "imagem" | "video",
  ) {
    const formData = new FormData();

    formData.append("arquivo", arquivo);
    formData.append("tipo", tipo);
    formData.append("usuario_uuid", usuarioUuid);

    const resposta = await fetch("/api/uploads", {
      method: "POST",
      body: formData,
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      throw new Error(dados.erro || "Erro ao enviar arquivo.");
    }

    return String(dados.url || "");
  }

  async function enviarSugestao(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setMensagem("");
    setCarregando(true);

    try {
      setEnviandoArquivos(true);

      let urlImagemPrincipal = "";
      let urlsImagensExtras: string[] = [];
      let urlVideo = "";

      if (arquivoImagemPrincipal) {
        urlImagemPrincipal = await enviarArquivoParaStorage(
          arquivoImagemPrincipal,
          "imagem",
        );
      }

      if (arquivosImagensExtras.length > 0) {
        urlsImagensExtras = await Promise.all(
          arquivosImagensExtras.map((arquivo) =>
            enviarArquivoParaStorage(arquivo, "imagem"),
          ),
        );
      }

      if (arquivoVideo) {
        urlVideo = await enviarArquivoParaStorage(arquivoVideo, "video");
      }

      setEnviandoArquivos(false);

      const resposta = await fetch("/api/sugestoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_uuid: usuarioUuid,

          titulo,
          local,
          bairro,
          categoria,
          descricao,
          justificativa,

          imagem_principal: urlImagemPrincipal,
          imagens_extras: urlsImagensExtras.join(","),
          video_url: urlVideo,

          etapas_sugeridas: etapasSugeridas,
          transparencia_info: transparenciaInfo,
          orgao_sugerido: orgaoSugerido,
          observacoes,
        }),
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Não foi possível enviar a sugestão.");
        setCarregando(false);
        return;
      }

      setMensagem(dados.mensagem || "Sugestão enviada com sucesso!");

      setTitulo("");
      setLocal("");
      setBairro("");
      setCategoria("");
      setDescricao("");
      setJustificativa("");

      setArquivoImagemPrincipal(null);
      setArquivosImagensExtras([]);
      setArquivoVideo(null);
      setEnviandoArquivos(false);

      setEtapasSugeridas("");
      setTransparenciaInfo("");
      setOrgaoSugerido("");
      setObservacoes("");
    } catch (error) {
      const mensagemErro =
        error instanceof Error
          ? error.message
          : "Erro inesperado ao conectar com o servidor.";

      setErro(mensagemErro);
      setEnviandoArquivos(false);
    } finally {
      setCarregando(false);
    }
  }

  if (verificandoLogin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-6 font-sans">
        <main className="rounded-3xl bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-bold text-black">
            Verificando acesso...
          </h1>

          <p className="mt-2 text-sm text-black/70">
            Você precisa estar logado para sugerir uma obra.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E3F1F1] to-[#CBDfde] p-4 font-sans sm:p-6">
      <main className="mx-auto w-full max-w-6xl rounded-3xl bg-[#C9D9DB] p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
        <header className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Participar</h1>

            <p className="mt-2 text-sm text-black/70">
              Sugira uma nova obra para resolver um problema da cidade.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AcoesUsuario />

            <nav className="flex flex-wrap gap-3 text-sm">
              <Link
                href="/"
                className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#E3F1F1]"
              >
                Início
              </Link>

              <Link
                href="/rotas/obras"
                className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#E3F1F1]"
              >
                Obras
              </Link>

              <Link
                href="/rotas/participar"
                className="rounded-xl bg-[#425C59] px-4 py-3 font-medium text-white transition hover:bg-[#334846]"
              >
                Participar
              </Link>

              <Link
                href="/rotas/ranking"
                className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#E3F1F1]"
              >
                Ranking
              </Link>

              <Link
                href="/rotas/sobre"
                className="rounded-xl px-4 py-3 font-medium text-black transition hover:bg-[#E3F1F1]"
              >
                Sobre
              </Link>
            </nav>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-3xl bg-[#425C59] p-6 text-white shadow-xl">
            <h2 className="text-2xl font-bold">Sugerir nova obra</h2>

            <p className="mt-4 text-sm leading-7 text-white/80">
              Use este espaço para informar um problema da cidade e sugerir uma
              obra que possa resolvê-lo. A sugestão enviada ficará em análise e
              futuramente poderá ser aprovada para entrar na lista de obras.
            </p>

            <div className="mt-6 space-y-4 rounded-2xl bg-white/10 p-5 text-sm text-white/85">
              <p>
                <strong className="text-white">Exemplo:</strong> “Minha rua
                precisa de pavimentação porque fica inacessível em dias de
                chuva.”
              </p>

              <p>
                <strong className="text-white">Outro exemplo:</strong> “A UBS do
                bairro precisa de reforma porque atende muitos moradores e está
                com estrutura precária.”
              </p>
            </div>

            <div className="mt-6 rounded-2xl bg-white/10 p-5 text-sm leading-6 text-white/80">
              <p>
                A ideia é transformar reclamações e problemas da cidade em
                propostas claras de obras públicas.
              </p>
            </div>
          </div>

          <form
            onSubmit={enviarSugestao}
            className="rounded-3xl bg-white/85 p-6 shadow-xl ring-1 ring-black/5"
          >
            <h2 className="text-xl font-bold text-black">Dados da sugestão</h2>

            <p className="mt-2 text-sm text-black/70">
              Preencha as informações que souber. Campos técnicos, como
              transparência e etapas, são opcionais porque podem ser completados
              depois pelos órgãos responsáveis.
            </p>

            <div className="mt-6 space-y-6">
              <section className="rounded-3xl bg-[#E3F1F1] p-5">
                <h3 className="text-lg font-bold text-black">
                  1. Informações principais
                </h3>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Título da obra sugerida
                    </label>

                    <input
                      type="text"
                      value={titulo}
                      onChange={(event) => setTitulo(event.target.value)}
                      placeholder="Ex: Pavimentação da Rua São José"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-black">
                        Local
                      </label>

                      <input
                        type="text"
                        value={local}
                        onChange={(event) => setLocal(event.target.value)}
                        placeholder="Ex: Rua São José"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-black">
                        Bairro ou região
                      </label>

                      <input
                        type="text"
                        value={bairro}
                        onChange={(event) => setBairro(event.target.value)}
                        placeholder="Ex: Centro"
                        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Categoria
                    </label>

                    <select
                      value={categoria}
                      onChange={(event) => setCategoria(event.target.value)}
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                    >
                      <option value="">Selecione uma categoria</option>

                      {categorias.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-[#E3F1F1] p-5">
                <h3 className="text-lg font-bold text-black">
                  2. Problema e impacto
                </h3>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Descrição do problema
                    </label>

                    <textarea
                      value={descricao}
                      onChange={(event) => setDescricao(event.target.value)}
                      placeholder="Descreva o problema que essa obra resolveria."
                      rows={5}
                      className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Justificativa ou impacto esperado
                    </label>

                    <textarea
                      value={justificativa}
                      onChange={(event) => setJustificativa(event.target.value)}
                      placeholder="Explique por que essa obra é importante para a população."
                      rows={4}
                      className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                    />
                  </div>

                  <div className="rounded-2xl bg-white p-4 text-sm leading-6 text-black/70 ring-1 ring-black/5">
                    <p className="font-semibold text-black">
                      Estimativa automática de prioridade
                    </p>

                    <p className="mt-2">
                      Você não precisa informar quantidade de pessoas
                      beneficiadas, urgência ou impacto social. O sistema fará
                      uma estimativa inicial automaticamente com base na
                      categoria, localização, descrição e justificativa
                      enviadas.
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-[#E3F1F1] p-5">
                <h3 className="text-lg font-bold text-black">
                  3. Imagens e vídeos
                </h3>

                <p className="mt-2 text-sm text-black/70">
                  Envie fotos ou vídeos que ajudem a mostrar o problema. A
                  imagem principal será usada como imagem do card da sugestão.
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Imagem principal
                    </label>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        setArquivoImagemPrincipal(
                          event.target.files?.[0] || null,
                        )
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-[#425C59] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#334846]"
                    />

                    <p className="mt-1 text-xs text-black/60">
                      Formatos aceitos: JPG, PNG ou WEBP. Tamanho máximo
                      recomendado: 5 MB.
                    </p>

                    {arquivoImagemPrincipal && (
                      <p className="mt-2 text-xs font-semibold text-[#425C59]">
                        Imagem selecionada: {arquivoImagemPrincipal.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Imagens extras
                    </label>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={(event) =>
                        setArquivosImagensExtras(
                          event.target.files
                            ? Array.from(event.target.files)
                            : [],
                        )
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-[#425C59] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#334846]"
                    />

                    <p className="mt-1 text-xs text-black/60">
                      Você pode enviar mais de uma imagem complementar.
                    </p>

                    {arquivosImagensExtras.length > 0 && (
                      <p className="mt-2 text-xs font-semibold text-[#425C59]">
                        {arquivosImagensExtras.length} imagem
                        {arquivosImagensExtras.length === 1 ? "" : "s"}{" "}
                        selecionada
                        {arquivosImagensExtras.length === 1 ? "" : "s"}.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Vídeo
                    </label>

                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
                      onChange={(event) =>
                        setArquivoVideo(event.target.files?.[0] || null)
                      }
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-[#425C59] file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-[#334846]"
                    />

                    <p className="mt-1 text-xs text-black/60">
                      Formatos aceitos: MP4, WEBM ou MOV. Tamanho máximo
                      recomendado: 50 MB.
                    </p>

                    {arquivoVideo && (
                      <p className="mt-2 text-xs font-semibold text-[#425C59]">
                        Vídeo selecionado: {arquivoVideo.name}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-[#E3F1F1] p-5">
                <h3 className="text-lg font-bold text-black">
                  4. Informações opcionais
                </h3>

                <p className="mt-2 text-sm text-black/70">
                  Esses campos ajudam se você souber alguma informação extra,
                  mas não são obrigatórios.
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Etapas sugeridas
                    </label>

                    <textarea
                      value={etapasSugeridas}
                      onChange={(event) =>
                        setEtapasSugeridas(event.target.value)
                      }
                      placeholder="Ex: levantamento, projeto, licitação, execução..."
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Transparência ou informação conhecida
                    </label>

                    <textarea
                      value={transparenciaInfo}
                      onChange={(event) =>
                        setTransparenciaInfo(event.target.value)
                      }
                      placeholder="Ex: promessa pública, informação de orçamento, edital conhecido..."
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Órgão sugerido
                    </label>

                    <input
                      type="text"
                      value={orgaoSugerido}
                      onChange={(event) => setOrgaoSugerido(event.target.value)}
                      placeholder="Ex: Secretaria Municipal de Obras"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-black">
                      Observações adicionais
                    </label>

                    <textarea
                      value={observacoes}
                      onChange={(event) => setObservacoes(event.target.value)}
                      placeholder="Adicione qualquer informação complementar."
                      rows={3}
                      className="w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#425C59]"
                    />
                  </div>
                </div>
              </section>

              {erro && (
                <div className="rounded-2xl bg-red-100 px-4 py-3 text-sm font-medium text-red-700">
                  {erro}
                </div>
              )}

              {mensagem && (
                <div className="rounded-2xl bg-green-100 px-4 py-3 text-sm font-medium text-green-700">
                  {mensagem}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-2xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-[#334846] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {carregando
                  ? enviandoArquivos
                    ? "Enviando arquivos..."
                    : "Enviando sugestão..."
                  : "Enviar sugestão de obra"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
