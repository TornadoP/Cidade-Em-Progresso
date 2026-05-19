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
    nome: "ESBURACAMENTO DE RUAS",
    endereço: "Rua das Flores, Bairro Jardim",
    investimento: "R$ 500.000,00",
    inicio: "01/01/2024",
    conclusão: "30/06/2024",
    progresso: 75,
    imagem: "/esburacamento.jpg",
    descricao: "Destruir completamente as ruas.",
  },
  {
    id: 2,
    nome: "Escola Municipal",
    endereço: "Avenida Central, Bairro Centro",
    investimento: "R$ 2.000.000,00",
    inicio: "15/02/2024",
    conclusão: "15/12/2024",
    progresso: 48,
    imagem: "/escola.jpg",
    descricao: "Construção de novas salas.",
  },
  {
    id: 3,
    nome: "Asfalto Bairro Novo",
    endereço: "Rua Nova, Bairro Novo",
    investimento: "R$ 1.200.000,00",
    inicio: "10/03/2024",
    conclusão: "10/09/2024",
    progresso: 33,
    imagem: "/asfalto.jpg",
    descricao: "Pavimentação completa.",
  },
  {
    id: 4,
    nome: "atirar uma pedra derruba um 7.62",
    endereço: "Rua do Caos, Bairro Selvagem",
    investimento: "R$ 999.999,99",
    inicio: "01/04/2024",
    conclusão: "01/10/2024",
    progresso: 33,
    imagem: "/caos.jpg",
    descricao: "Pavimentação completa.",
  },
  {
    id: 5,
    nome: "Construção de Parque",
    endereço: "Avenida Verde, Bairro Ecológico",
    investimento: "R$ 800.000,00",
    inicio: "20/01/2024",
    conclusão: "20/07/2024",
    progresso: 60,
    imagem: "/parque.jpg",
    descricao: "Criação de áreas verdes e lazer.",
  },
];

export default function page() {
  return (
    <main>
      <h1>Conteúdo Principal</h1>
    </main>
  );
}
