export type Obra = {
  id: string;
  titulo: string;
  local: string;
  investimento: string;
  inicio: string;
  prazo: string;
  progresso: string;
  status: string;
  tipo: string;
  imagem: string;
  descricao: string;
  detalhes: string;
  orgao: string;
  empresa: string;
  ultimaAtualizacao: string;
};

export const obras: Obra[] = [
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
    imagem:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Revitalização da Praça Central para melhorar o espaço de convivência, lazer e acessibilidade da população.",
    detalhes:
      "A obra prevê troca de piso, instalação de bancos, iluminação em LED, paisagismo, área infantil e melhorias de acessibilidade.",
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
    imagem:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Pavimentação da Rua Maneco Rego para melhorar o tráfego, reduzir poeira e facilitar o deslocamento dos moradores.",
    detalhes:
      "A intervenção inclui preparação do solo, drenagem básica, pavimentação, nivelamento da via e sinalização.",
    orgao: "Secretaria Municipal de Infraestrutura",
    empresa: "Pavimenta Maranhão Ltda.",
    ultimaAtualizacao: "08/05/2026 às 09:20",
  },
  {
    id: "construcao-escola-municipal",
    titulo: "Construção de Escola Municipal",
    local: "Bairro Novo, Pedreiras - MA",
    investimento: "R$ 1,2 milhão",
    inicio: "01/01/2026",
    prazo: "30/11/2026",
    progresso: "45%",
    status: "Em andamento",
    tipo: "Educação",
    imagem:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Construção de uma nova escola municipal para ampliar o acesso à educação básica no município.",
    detalhes:
      "O projeto prevê salas de aula, área administrativa, banheiros, pátio coberto, cozinha, depósito e estrutura acessível.",
    orgao: "Secretaria Municipal de Educação",
    empresa: "Construtora Educar Ltda.",
    ultimaAtualizacao: "01/05/2026 às 11:10",
  },
  {
    id: "reforma-ubs-mutirao",
    titulo: "Reforma da UBS do Mutirão",
    local: "Bairro Mutirão, Pedreiras - MA",
    investimento: "R$ 100 mil",
    inicio: "20/03/2026",
    prazo: "20/09/2026",
    progresso: "85%",
    status: "Quase concluída",
    tipo: "Saúde",
    imagem:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Reforma da Unidade Básica de Saúde para melhorar o atendimento médico e a estrutura oferecida à população.",
    detalhes:
      "A obra inclui pintura, troca de instalações elétricas, melhorias nas salas de atendimento, recepção e adequações estruturais.",
    orgao: "Secretaria Municipal de Saúde",
    empresa: "Saúde Obras Ltda.",
    ultimaAtualizacao: "12/05/2026 às 16:40",
  },
  {
    id: "drenagem-avenida-rio-mearim",
    titulo: "Drenagem da Avenida Rio Mearim",
    local: "Avenida Rio Mearim, Pedreiras - MA",
    investimento: "R$ 480 mil",
    inicio: "05/04/2026",
    prazo: "05/10/2026",
    progresso: "38%",
    status: "Em andamento",
    tipo: "Drenagem",
    imagem:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Implantação de sistema de drenagem para reduzir alagamentos em períodos de chuva.",
    detalhes:
      "A intervenção inclui escavação, instalação de tubulações, bocas de lobo, recomposição do pavimento e limpeza do sistema.",
    orgao: "Secretaria Municipal de Infraestrutura",
    empresa: "Drenar Engenharia Ltda.",
    ultimaAtualizacao: "15/05/2026 às 10:15",
  },
  {
    id: "quadra-poliesportiva-sao-francisco",
    titulo: "Quadra Poliesportiva São Francisco",
    local: "Bairro São Francisco, Pedreiras - MA",
    investimento: "R$ 320 mil",
    inicio: "12/02/2026",
    prazo: "12/08/2026",
    progresso: "60%",
    status: "Em andamento",
    tipo: "Esporte",
    imagem:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80",

    descricao:
      "Construção de quadra poliesportiva para incentivar esporte, lazer e atividades comunitárias.",
    detalhes:
      "O projeto prevê piso esportivo, alambrado, iluminação, arquibancada simples e marcações para múltiplas modalidades.",
    orgao: "Secretaria Municipal de Esporte e Lazer",
    empresa: "Esporte Construções Ltda.",
    ultimaAtualizacao: "18/05/2026 às 15:00",
  },
  {
    id: "reforma-mercado-municipal",
    titulo: "Reforma do Mercado Municipal",
    local: "Centro Comercial, Pedreiras - MA",
    investimento: "R$ 700 mil",
    inicio: "01/06/2026",
    prazo: "20/12/2026",
    progresso: "15%",
    status: "Iniciada",
    tipo: "Comércio",
    imagem:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Reforma estrutural do Mercado Municipal para melhorar a organização, higiene e circulação de feirantes e consumidores.",
    detalhes:
      "A obra inclui melhorias na cobertura, boxes, instalações elétricas, hidráulicas, banheiros e áreas de circulação.",
    orgao: "Secretaria Municipal de Desenvolvimento Econômico",
    empresa: "Mercado Novo Engenharia Ltda.",
    ultimaAtualizacao: "03/06/2026 às 08:50",
  },
  {
    id: "iluminacao-publica-vila-das-palmeiras",
    titulo: "Iluminação Pública Vila das Palmeiras",
    local: "Vila das Palmeiras, Pedreiras - MA",
    investimento: "R$ 90 mil",
    inicio: "10/01/2026",
    prazo: "10/04/2026",
    progresso: "100%",
    status: "Concluída",
    tipo: "Iluminação",
    imagem:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Modernização da iluminação pública com instalação de lâmpadas de LED em ruas da comunidade.",
    detalhes:
      "Foram instaladas luminárias de LED, braços metálicos e ajustes na rede para melhorar segurança e visibilidade noturna.",
    orgao: "Secretaria Municipal de Obras",
    empresa: "Luz Forte Serviços Ltda.",
    ultimaAtualizacao: "11/04/2026 às 17:25",
  },
  {
    id: "revitalizacao-calcada-centro",
    titulo: "Revitalização das Calçadas do Centro",
    local: "Centro, Pedreiras - MA",
    investimento: "R$ 180 mil",
    inicio: "18/04/2026",
    prazo: "18/09/2026",
    progresso: "52%",
    status: "Em andamento",
    tipo: "Acessibilidade",
    imagem:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Revitalização das calçadas do centro da cidade para melhorar a mobilidade urbana e a acessibilidade dos pedestres.",
    detalhes:
      "O projeto inclui nivelamento de calçadas, instalação de rampas de acessibilidade, recuperação de trechos danificados e sinalização para pedestres.",
    orgao: "Secretaria Municipal de Urbanismo",
    empresa: "Urbaniza Pedreiras Ltda.",
    ultimaAtualizacao: "20/05/2026 às 13:45",
  },
  {
    id: "construcao-praca-vila-palmeiras",
    titulo: "Construção da Praça Vila das Palmeiras",
    local: "Vila das Palmeiras, Pedreiras - MA",
    investimento: "R$ 360 mil",
    inicio: "02/05/2026",
    prazo: "02/12/2026",
    progresso: "28%",
    status: "Em andamento",
    tipo: "Lazer",
    imagem:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
    descricao:
      "Construção de uma nova praça pública para oferecer mais opções de lazer, convivência e atividades ao ar livre para os moradores.",
    detalhes:
      "A obra prevê implantação de área verde, bancos, iluminação em LED, playground, espaço para caminhada e acessibilidade.",
    orgao: "Secretaria Municipal de Obras",
    empresa: "Construtora Espaço Verde Ltda.",
    ultimaAtualizacao: "22/05/2026 às 16:10",
  },
];
