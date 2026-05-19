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
    endereço: "Endereço nota 1000",
    investimento: "Investimento 1zilhao",
    inicio: "Inicio 1 AC",
    conclusão: "Conclusão 1945",
    progresso: 50,
    imagem: "https://www.pedreiras.ma.gov.br/fotos/738/Img0_600x400.jpg",
    descricao:
      "Destruir completamente as ruas, até que não sobre mais asfalto Destruir completamente as ruas, até que não sobre mais asfalto, taca uma bomba logo, até que não sobre mais nada não precisa ter rua, só lama já serve.",
  },
];
