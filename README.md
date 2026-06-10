# Cidade em Progresso

**Cidade em Progresso** é uma plataforma web de transparência pública e participação cidadã voltada para o acompanhamento de obras públicas no município de **Pedreiras – MA**.

O projeto permite que cidadãos visualizem obras públicas reais, acompanhem informações oficiais, consultem documentos, votem em prioridades e enviem sugestões populares para melhorias na cidade.

---

## Sobre o projeto

Muitas informações sobre obras públicas existem na internet, mas geralmente estão espalhadas, com linguagem técnica ou em páginas difíceis de navegar. O objetivo do **Cidade em Progresso** é transformar esses dados em uma experiência mais simples, visual e acessível para a população.

A plataforma diferencia dois tipos de registros:

* **Obras oficiais:** obras importadas a partir de fontes públicas, com dados da Prefeitura de Pedreiras – MA.
* **Sugestões populares:** demandas enviadas pelos cidadãos, como pedidos de pavimentação, iluminação, saúde, educação, lazer, drenagem ou manutenção urbana.

---

## Funcionalidades principais

* Listagem de obras públicas.
* Página de detalhes de cada obra.
* Exibição de progresso, status, localização, investimento, órgão responsável e empresa executora.
* Selo azul para **Obra oficial**.
* Selo amarelo para **Sugestão popular**.
* Consulta de documentos oficiais em PDF.
* Sistema de votos por prioridade.
* Limite de até 5 votos ativos por cidadão.
* Cadastro e login de usuários.
* Perfil do cidadão com histórico de participação.
* Envio de sugestões populares.
* Upload de imagens e vídeos em sugestões.
* Painel administrativo protegido.
* Importação manual de obras reais da Prefeitura de Pedreiras.
* Gerenciamento de administradores.
* Busca com suporte a palavras sem acento e termos semelhantes.

---

## Objetivo

O objetivo do projeto é aproximar o cidadão das informações públicas e criar um canal simples de participação social.

Com a plataforma, o cidadão pode:

* Acompanhar obras públicas de forma mais clara.
* Consultar documentos oficiais.
* Votar nas obras que considera prioritárias.
* Enviar sugestões de melhorias para a cidade.
* Participar de forma mais ativa da fiscalização e acompanhamento urbano.

---

## Tecnologias utilizadas

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**
* **Supabase**
* **PostgreSQL**
* **Supabase Auth**
* **Supabase Storage**
* **Vercel**
* **GitHub**

---

## Estrutura geral do sistema

O sistema é composto por:

* Interface pública para cidadãos.
* Área de autenticação.
* Perfil do usuário.
* Página de participação popular.
* Página de listagem e detalhes de obras.
* Painel administrativo.
* APIs internas para votos, sugestões, uploads, importação e permissões.
* Banco de dados Supabase com RLS ativado.
* Storage para imagens e vídeos.

---

## Regras de votação

Cada cidadão pode manter até **5 votos ativos** ao mesmo tempo.

Quando uma obra é concluída, os votos nela deixam de ocupar o limite ativo do usuário, mas continuam registrados como histórico e como total de participação da obra.

Essa regra evita abuso e mantém o sistema de prioridades mais organizado.

---

## Obras oficiais e sugestões populares

### Obras oficiais

São obras importadas de fontes públicas. Elas recebem um selo azul de identificação e representam registros oficiais encontrados em páginas públicas da Prefeitura.

### Sugestões populares

São demandas enviadas pelos cidadãos. Elas recebem um selo amarelo e indicam necessidades percebidas pela comunidade, mas não significam necessariamente que a obra já foi oficializada pelo poder público.

---

## Segurança

O projeto utiliza algumas camadas básicas de segurança:

* Autenticação com Supabase Auth.
* Row Level Security no Supabase.
* Rotas administrativas protegidas no back-end.
* Validação de permissões para admins.
* Validação de uploads.
* Separação entre chave pública e chave de serviço.
* Bloqueio de acesso comum ao painel administrativo.
* Controle de permissões para ações sensíveis.

---

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as variáveis necessárias:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=
IMPORT_SECRET=
```

Atenção:

* `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` podem ser públicas.
* `SUPABASE_SERVICE_ROLE_KEY` nunca deve ser exposta no front-end.
* Nunca envie `.env.local` para o GitHub.

---

## Como rodar o projeto localmente

Clone o repositório:

```bash
git clone URL_DO_REPOSITORIO
```

Entre na pasta do projeto:

```bash
cd cidade-em-progresso
```

Instale as dependências:

```bash
npm install
```

Configure o arquivo `.env.local`.

Rode o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```txt
http://localhost:3000
```

---

## Deploy

O projeto foi preparado para deploy na **Vercel**.

Fluxo recomendado:

1. Criar repositório no GitHub.
2. Conectar o repositório à Vercel.
3. Configurar as variáveis de ambiente na Vercel.
4. Fazer deploy da branch principal.
5. Proteger a branch `main` com Pull Requests.

---

## Status do projeto

O projeto está em fase de **MVP funcional**.

Funcionalidades já implementadas:

* Obras reais importadas.
* Navegação por obras.
* Detalhamento de obras.
* Documentos oficiais.
* Votos.
* Sugestões populares.
* Perfil do usuário.
* Painel admin.
* Controle básico de segurança.

Funcionalidades futuras possíveis:

* OCR automático de documentos PDF.
* Extração automática de imagens de relatórios fotográficos.
* Mapa interativo real.
* Dashboard estatístico.
* Notificações.
* Moderação avançada de sugestões.
* Ranking por bairro.
* Comentários públicos.
* Integração ampliada com bases públicas.

---

## Finalidade acadêmica

Este projeto foi desenvolvido como uma solução de tecnologia cívica, com foco em transparência pública, participação social e inovação para cidades.

O **Cidade em Progresso** demonstra como dados públicos podem ser organizados em uma plataforma acessível, permitindo que a população acompanhe obras, consulte documentos e participe da definição de prioridades urbanas.

---

## Autor

Projeto desenvolvido por **Matheus Silva e Denilson Silva** e equipe, como iniciativa acadêmica voltada à participação cidadã e transparência pública em Pedreiras – MA.
