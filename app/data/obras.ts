export const obras = [
  {
    id: "reforma-praca-central",
    titulo: "Reforma da Praça Central",
    local: "Centro, Pedreiras - MA",
    investimento: "R$ 250 mil",
    inicio: "10/03/2026",
    prazo: "30/09/2026",
    progresso: "72%",
    status: "Em andamento",
    tipo: "Lazer",
    imagem: "/obra-principal.png",
    descricao:
      "A reforma da Praça Central tem como objetivo revitalizar o principal espaço público de convivência da cidade.",
    detalhes:
      "O projeto inclui requalificação do piso, novo paisagismo, iluminação em LED, bancos e melhorias na acessibilidade.",
    orgao: "Secretaria Municipal de Obras",
    empresa: "Construtora Boa Vista Ltda.",
    ultimaAtualizacao: "10/05/2026 às 14:30",
  },
  {
    id: "pavimentacao-rua-maneco-rego",
    titulo: "Pavimentação Rua Maneco Rego",
    local: "Bairro Centro, Pedreiras - MA",
    investimento: "R$ 150 mil",
    inicio: "15/02/2026",
    prazo: "15/08/2026",
    progresso: "70%",
    status: "Em andamento",
    tipo: "Pavimentação",
    imagem: "/obra-principal.png",
    descricao:
      "Obra de pavimentação voltada para melhorar o tráfego e facilitar o deslocamento dos moradores.",
    detalhes:
      "A intervenção prevê preparação do solo, drenagem, pavimentação e sinalização básica.",
    orgao: "Secretaria Municipal de Infraestrutura",
    empresa: "Pavimenta Maranhão Ltda.",
    ultimaAtualizacao: "08/05/2026 às 09:20",
  },
  {
    id: "construcao-escola-municipal",
    titulo: "Construção de Escola Municipal",
    local: "Bairro Novo, Pedreiras - MA",
    investimento: "R$ 200 mil",
    inicio: "01/01/2026",
    prazo: "30/06/2026",
    progresso: "45%",
    status: "Planejada",
    tipo: "Educação",
    imagem: "/obra-principal.png",
    descricao:
      "Construção de uma nova unidade escolar para ampliar o acesso à educação básica no município.",
    detalhes:
      "O projeto prevê salas de aula, área administrativa, banheiros, pátio coberto e estrutura acessível.",
    orgao: "Secretaria Municipal de Educação",
    empresa: "Construtora Educar Ltda.",
    ultimaAtualizacao: "01/05/2026 às 11:10",
  },
  {
    id: "reforma-ubs",
    titulo: "Reforma da UBS",
    local: "Bairro Mutirão, Pedreiras - MA",
    investimento: "R$ 100 mil",
    inicio: "20/03/2026",
    prazo: "20/09/2026",
    progresso: "85%",
    status: "Quase concluída",
    tipo: "Saúde",
    imagem: "/obra-principal.png",
    descricao:
      "Reforma da Unidade Básica de Saúde para melhorar o atendimento à população local.",
    detalhes:
      "A obra inclui pintura, troca de instalações, melhorias nas salas de atendimento e adequações estruturais.",
    orgao: "Secretaria Municipal de Saúde",
    empresa: "Saúde Obras Ltda.",
    ultimaAtualizacao: "12/05/2026 às 16:40",
  },
];

export type Obra = (typeof obras)[number];
