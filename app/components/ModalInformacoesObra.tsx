"use client";

import { useState } from "react";

type ObraModal = {
  titulo?: string | null;
  local?: string | null;
  investimento?: string | null;
  inicio?: string | null;
  prazo?: string | null;
  progresso?: number | string | null;
  status?: string | null;
  tipo?: string | null;
  descricao?: string | null;
  detalhes?: string | null;
  orgao?: string | null;
  empresa?: string | null;
  ultima_atualizacao?: string | null;
  origem?: string | null;
};

type Props = {
  obra: ObraModal;
};

function extrairLinkFonte(detalhes?: string | null) {
  if (!detalhes) return null;

  const match = detalhes.match(/https?:\/\/[^\s]+/);

  return match?.[0] || null;
}

function extrairTotalMedido(detalhes?: string | null) {
  if (!detalhes) return "Não informado";

  const match = detalhes.match(/Total medido:\s*(.*?)\.\s*Link:/i);

  return match?.[1]?.trim() || "Não informado";
}

function Info({
  label,
  value,
  full = false,
}: {
  label: string;
  value?: string | number | null;
  full?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <p className="text-xs font-bold uppercase tracking-wide text-[#425C59]/70">
        {label}
      </p>

      <p className="mt-1 rounded-2xl bg-[#E3F1F1] px-4 py-3 text-sm leading-6 text-black/75">
        {value || "Não informado"}
      </p>
    </div>
  );
}

export default function ModalInformacoesObra({ obra }: Props) {
  const [aberto, setAberto] = useState(false);

  const linkFonte = extrairLinkFonte(obra.detalhes);
  const totalMedido = extrairTotalMedido(obra.detalhes);

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-5 inline-flex rounded-xl bg-[#425C59] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#314744]"
      >
        Ver mais informações
      </button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-[#425C59]">
                  Transparência
                </p>

                <h2 className="mt-1 text-2xl font-bold text-black">
                  Informações oficiais da obra
                </h2>

                <p className="mt-2 text-sm leading-6 text-black/60">
                  Dados organizados a partir da fonte pública oficial.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-black transition hover:bg-zinc-200"
              >
                Fechar
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Título" value={obra.titulo} full />
              <Info label="Origem" value={obra.origem} />
              <Info label="Status" value={obra.status} />
              <Info label="Tipo" value={obra.tipo} />
              <Info
                label="Progresso informado"
                value={`${obra.progresso || 0}%`}
              />
              <Info label="Investimento previsto" value={obra.investimento} />
              <Info label="Total medido" value={totalMedido} />
              <Info label="Data de início" value={obra.inicio} />
              <Info label="Prazo" value={obra.prazo} />
              <Info label="Órgão responsável" value={obra.orgao} />
              <Info label="Empresa executora" value={obra.empresa} />
              <Info
                label="Última atualização"
                value={obra.ultima_atualizacao}
              />
              <Info label="Localização" value={obra.local} full />
              <Info label="Resumo" value={obra.descricao} full />
              <Info label="Detalhes da fonte" value={obra.detalhes} full />
            </div>

            {linkFonte && (
              <a
                href={linkFonte}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex rounded-xl border border-[#425C59] px-5 py-3 text-sm font-bold text-[#425C59] transition hover:bg-[#E3F1F1]"
              >
                Abrir fonte oficial ↗
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
