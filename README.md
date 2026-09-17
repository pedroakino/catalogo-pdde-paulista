# Catálogo PDDE Paulista 2026

Aplicação web para consulta do **Catálogo de Itens do PDDE Paulista**, organizada a partir da planilha fornecida para o exercício de 2026.

## Funcionalidades

- busca geral por item, objeto, descrição, especificação, fonte e beneficiário;
- navegação pelos cinco eixos do catálogo;
- filtros por objeto, situação, natureza e fonte de recurso;
- listagem paginada e responsiva;
- modal com detalhamento completo do item;
- identificação de itens permitidos e não permitidos;
- visualização de fontes, natureza, ART/RRT, manifestação prévia e beneficiários.

## Base de dados

A base foi convertida para JSON, compactada e armazenada em partes textuais dentro de `public/data/`. O navegador recompõe e descompacta os dados ao abrir o catálogo, sem necessidade de banco de dados nesta versão.

A planilha de origem possui **1.286 linhas de dados**. Como cinco linhas trazem simultaneamente um item permitido e outro não permitido, a aplicação apresenta **1.291 itens individualizados**.

Base informada na planilha: **19/08/2026**.

## Desenvolvimento

```bash
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## Publicação

O projeto foi preparado para publicação na Vercel por integração com o repositório GitHub.
