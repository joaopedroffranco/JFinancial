# JFinancial

Aplicação web local-first para fechamento financeiro pessoal.

## Desenvolvimento

Requisitos:

- Node.js 22 ou superior;
- npm 10 ou superior.

## Tutorial rápido do Vite

Na primeira execução, instale as dependências:

```bash
npm install
```

Depois, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra o endereço exibido no terminal, normalmente `http://localhost:5173`.
Enquanto o processo estiver rodando, alterações salvas no código aparecem no navegador por hot reload. Para encerrar o servidor, pressione `Ctrl+C` no terminal.

## Verificações

```bash
npm run typecheck
npm run lint
npm run build
```

## Estrutura

```text
src/
├── app/             # bootstrap, rotas e providers
├── domain/          # entidades e regras financeiras puras
├── application/     # casos de uso e orquestração
├── infrastructure/  # IndexedDB, parsers, backup e exportadores
└── ui/
    ├── design-system/ # tokens, assets, fontes e componentes reutilizáveis
    ├── pages/         # composição das telas
    └── styles/        # estilos globais
```
