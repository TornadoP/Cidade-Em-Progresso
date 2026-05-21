import Link from "next/link";

export default async function ObraPage(params: { id: string }) {
  const { id } = await params;

  const obra = obras.find((item) => item.id === Number(id));

  return (
    <main className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-black">detalhe da obra</h1>
    </main>
  );
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
      imagem: "https://www.pedreiras.ma.gov.br/fotos/738/Img0_600x400.jpg",
      descricao:
        "Destruir completamente as ruas, até que não sobre mais asfalto Destruir completamente as ruas, até que não sobre mais asfalto, taca uma bomba logo, até que não sobre mais nada não precisa ter rua, só lama já serve.",
    },
    {
      id: 2,
      nome: "Escola Municipal",
      endereço: "Avenida Central, Bairro Centro",
      investimento: "R$ 2.000.000,00",
      inicio: "15/02/2024",
      conclusão: "15/12/2024",
      progresso: 48,
      imagem:
        "https://www.folhabv.com.br/wp-content/uploads/2024/04/ESCOLA-PROFESSOR-DIOMEDES-FOTO-NILZETE-FRANCO-3-1024x683.jpg",
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
      imagem:
        "https://f.i.uol.com.br/fotografia/2023/12/04/1701724804656e4284e0098_1701724804_3x2_rt.jpg",
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
      imagem:
        "https://s2.glbimg.com/LvSZ_Ig3NxNvTgA1dbzSf6cP0f8=/e.glbimg.com/og/ed/f/original/2018/01/12/73633385_ri-rio-de-janeiro-rj-13-12-2017-crise-no-estado-governo-do-estado-corta-o-orcamento-da-pm-e.jpg",
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
}
