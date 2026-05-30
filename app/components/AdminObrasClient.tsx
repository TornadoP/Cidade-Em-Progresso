"use client";

import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";

type ObraAdmin = {
  id: string;
  fonte_id: string | null;
  titulo: string | null;
  local: string | null;
  investimento: string | null;
  inicio: string | null;
  prazo: string | null;
  progresso: number | string | null;
  status: string | null;
  tipo: string | null;
  imagem: string | null;
  descricao: string | null;
  orgao: string | null;
  empresa: string | null;
  ultima_atualizacao: string | null;
  origem: string | null;
};

type Props = {
  obras: ObraAdmin[];
};

const tipos = [
  "Educação",
  "Saúde",
  "Infraestrutura",
  "Lazer",
  "Patrimônio público",
];

const statusObra = [
  "Em planejamento",
  "Em andamento",
  "Concluída",
  "Cancelada",
];

function imagemPorTipo(tipo: string) {
  if (tipo === "Educação") return "/obras/educacao.jpg";
  if (tipo === "Saúde") return "/obras/saude.jpg";
  if (tipo === "Infraestrutura") return "/obras/infraestrutura.jpg";
  if (tipo === "Lazer") return "/obras/lazer.jpg";
  if (tipo === "Patrimônio público") return "/obras/patrimonio.jpg";

  return "/obra-principal.png";
}

export default function AdminObrasClient({ obras }: Props) {
  const [lista, setLista] = useState(obras);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [obraAntesDaEdicao, setObraAntesDaEdicao] =
    useState<ObraAdmin | null>(null);
  const [salvandoId, setSalvandoId] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  function iniciarEdicao(obra: ObraAdmin) {
    setMensagem("");
    setErro("");
    setObraAntesDaEdicao(obra);
    setEditandoId(obra.id);
  }

  function cancelarEdicao() {
    if (obraAntesDaEdicao) {
      setLista((obrasAtuais) =>
        obrasAtuais.map((obraAtual) =>
          obraAtual.id === obraAntesDaEdicao.id
            ? obraAntesDaEdicao
            : obraAtual,
        ),
      );
    }

    setObraAntesDaEdicao(null);
    setEditandoId(null);
  }

  function atualizarCampo(id: string, campo: keyof ObraAdmin, valor: string) {
    setLista((obrasAtuais) =>
      obrasAtuais.map((obra) => {
        if (obra.id !== id) return obra;

        const obraAtualizada = {
          ...obra,
          [campo]: valor,
        };

        if (campo === "tipo") {
          obraAtualizada.imagem = imagemPorTipo(valor);
        }

        return obraAtualizada;
      }),
    );
  }

  async function salvarObra(obra: ObraAdmin) {
    setMensagem("");
    setErro("");
    setSalvandoId(obra.id);

    try {
      const { data: sessao } = await supabase.auth.getSession();
      const token = sessao.session?.access_token;

      if (!token) {
        throw new Error("Você precisa estar logado para editar.");
      }

      const resposta = await fetch("/api/admin/obras", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: obra.id,
          titulo: obra.titulo,
          tipo: obra.tipo,
          status: obra.status,
          imagem: obra.imagem,
          descricao: obra.descricao,
          local: obra.local,
          investimento: obra.investimento,
          inicio: obra.inicio,
          prazo: obra.prazo,
          orgao: obra.orgao,
          empresa: obra.empresa,
          ultima_atualizacao: obra.ultima_atualizacao,
        }),
      });

      const json = await resposta.json();

      if (!resposta.ok) {
        throw new Error(json.erro || "Erro ao salvar obra.");
      }

      setLista((obrasAtuais) =>
        obrasAtuais.map((obraAtual) =>
          obraAtual.id === obra.id ? json.obra : obraAtual,
        ),
      );
      setMensagem("Obra atualizada com sucesso.");
      setObraAntesDaEdicao(null);
      setEditandoId(null);
    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao salvar obra.",
      );
    } finally {
      setSalvandoId(null);
    }
  }

  return (
    <div className="mt-8">
      {mensagem && (
        <div className="mb-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
          {mensagem}
        </div>
      )}

      {erro && (
        <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {erro}
        </div>
      )}

      <div className="space-y-4">
        {lista.map((obra) => {
          const editando = editandoId === obra.id;

          return (
            <article
              key={obra.id}
              className="rounded-3xl border border-black/10 bg-[#F8FAFA] p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  {!editando ? (
                    <>
                      <h2 className="text-xl font-bold text-black">
                        {obra.titulo}
                      </h2>

                      <p className="mt-2 text-sm text-black/60">
                        {obra.tipo} - {obra.status} - {obra.origem}
                      </p>

                      <p className="mt-2 text-sm text-black/60">
                        Progresso: {obra.progresso || 0}% - Investimento:{" "}
                        {obra.investimento || "Não informado"}
                      </p>
                    </>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Campo
                        label="Título"
                        value={obra.titulo || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "titulo", valor)
                        }
                        full
                      />

                      <Select
                        label="Tipo"
                        value={obra.tipo || ""}
                        options={tipos}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "tipo", valor)
                        }
                      />

                      <Select
                        label="Status"
                        value={obra.status || ""}
                        options={statusObra}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "status", valor)
                        }
                      />

                      <Campo
                        label="Imagem principal"
                        value={obra.imagem || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "imagem", valor)
                        }
                        full
                      />

                      <Campo
                        label="Local"
                        value={obra.local || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "local", valor)
                        }
                        full
                      />

                      <Campo
                        label="Investimento"
                        value={obra.investimento || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "investimento", valor)
                        }
                      />

                      <Campo
                        label="Início"
                        value={obra.inicio || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "inicio", valor)
                        }
                      />

                      <Campo
                        label="Prazo"
                        value={obra.prazo || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "prazo", valor)
                        }
                      />

                      <Campo
                        label="Órgão"
                        value={obra.orgao || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "orgao", valor)
                        }
                      />

                      <Campo
                        label="Empresa"
                        value={obra.empresa || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "empresa", valor)
                        }
                      />

                      <AreaTexto
                        label="Descrição"
                        value={obra.descricao || ""}
                        onChange={(valor) =>
                          atualizarCampo(obra.id, "descricao", valor)
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {!editando ? (
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(obra)}
                      className="rounded-xl bg-[#FFC222] px-4 py-3 text-sm font-bold text-black transition hover:bg-[#eab308]"
                    >
                      Editar
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => salvarObra(obra)}
                        disabled={salvandoId === obra.id}
                        className="rounded-xl bg-[#425C59] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#314744] disabled:opacity-60"
                      >
                        {salvandoId === obra.id ? "Salvando..." : "Salvar"}
                      </button>

                      <button
                        type="button"
                        onClick={cancelarEdicao}
                        className="rounded-xl border border-black/20 px-4 py-3 text-sm font-bold text-black transition hover:bg-black/5"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function Campo({
  label,
  value,
  onChange,
  full = false,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
  full?: boolean;
}) {
  return (
    <label className={full ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-sm font-bold text-black">{label}</span>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#425C59]"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (valor: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-bold text-black">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#425C59]"
      >
        <option value="">Selecione</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AreaTexto({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <label className="md:col-span-2">
      <span className="mb-2 block text-sm font-bold text-black">{label}</span>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-[#425C59]"
      />
    </label>
  );
}
