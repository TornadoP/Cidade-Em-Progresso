import Link from "next/link";

type Obra = {
  id: number;
  nome: string;
  endereço: string;
  investimento: string;
  inicio: string;
  conclusão: string;
  descricao: string;
  progresso: number;
  imagem: string;
};

const obras: Obra[] = [
  {
    id: 1,
    nome: "Obra 1",
    endereço: "Endereço 1",
    investimento: "Investimento 1",
    inicio: "Inicio 1",
    conclusão: "Conclusão 1",
    progresso: 50,

    imagem: "/obra1.jpg",
    descricao: "Descrição 1",
  },
];
