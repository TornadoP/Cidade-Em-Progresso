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
export default function NomeDaPagina() {
  return (
    <main>
      <h1>Conteúdo Principal</h1>
    </main>
  );
}
