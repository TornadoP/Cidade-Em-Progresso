type Obra = {
  id: number;
  nome: string;
  descricao: string;
  progresso: number;
};

const obras: Obra[] = [
  {
    id: 1,
    nome: "ESBURACAMENTO DE RUAS",
    descricao: "Destruir completamente as ruas.",
    progresso: 75,
  },
  {
    id: 2,
    nome: "Escola Municipal",
    descricao: "Construção de novas salas.",
    progresso: 48,
  },
  {
    id: 3,
    nome: "Asfalto Bairro Novo",
    descricao: "Pavimentação completa.",
    progresso: 33,
  },
  {
    id: 4,
    nome: "trocar tiro com upp",
    descricao: "Pavimentação completa.",
    progresso: 33,
  },
];

export default function ObraDetalhe({ params }: { params: { id: string } }) {
  const obra = obras.find((item) => item.id === Number(params.id));

  if (!obra) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Obra não encontrada</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-zinc-100">
      <div className="bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-4">{obra.nome}</h1>

        <p className="mb-4">{obra.descricao}</p>

        <div className="w-full bg-zinc-200 h-4 rounded-full overflow-hidden">
          <div
            className="bg-green-500 h-full"
            style={{ width: `${obra.progresso}%` }}
          />
        </div>

        <p className="mt-2 font-semibold">{obra.progresso}% concluído</p>
      </div>
    </div>
  );
}
