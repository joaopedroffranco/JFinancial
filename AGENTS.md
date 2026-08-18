# JFinancial — Instruções para agentes

## Contexto do produto

JFinancial é uma aplicação web de finanças pessoais, inicialmente voltada apenas ao perfil do João. O produto deve importar movimentações bancárias, normalizá-las, aplicar regras financeiras determinísticas, solicitar revisão humana quando necessário e produzir um fechamento mensal auditável.

O projeto é local-first:

- não possui backend;
- não depende de APIs de IA;
- não envia arquivos ou dados financeiros para serviços externos;
- persiste os dados localmente no navegador;
- descarta os arquivos bancários originais após a extração;
- mantém transações normalizadas, metadados da importação e snapshots dos fechamentos confirmados;
- deve oferecer backup e restauração local antes de ser considerado pronto para uso real.

## Escopo atual

Trabalhar somente com o perfil do João. Não implementar seleção ou gerenciamento de múltiplos perfis até solicitação explícita.

O planejamento financeiro será mantido dentro da aplicação. Não integrar com Google Sheets. A página de contas fixas deve conter apenas:

- nome;
- descrição;
- categoria;
- valor previsto;
- total mensal previsto calculado automaticamente.

A meta mensal de investimento é uma configuração separada das contas fixas.

## Stack e arquitetura

Usar como base:

- React;
- TypeScript com modo estrito;
- Vite;
- React Router;
- IndexedDB por meio do Dexie;
- Zod para validação em fronteiras de entrada;
- React Hook Form para formulários.

Separar responsabilidades em camadas equivalentes a:

```text
src/
├── app/             # bootstrap, rotas e providers
├── domain/          # entidades e regras financeiras puras
├── application/     # casos de uso e orquestração
├── infrastructure/  # IndexedDB, parsers, backup e exportadores
└── ui/
    ├── design-system/ # tokens, assets, fontes e componentes reutilizáveis
    ├── pages/         # composição das telas
    └── styles/        # estilos globais da aplicação
```

Regras de dependência:

- `domain` não deve importar React, Dexie nem detalhes de arquivos;
- componentes React não devem acessar tabelas Dexie diretamente;
- parsers extraem e normalizam dados, mas não decidem silenciosamente a natureza financeira de casos ambíguos;
- cálculos financeiros devem ser funções puras e determinísticas;
- validar dados externos antes de persistir;
- processamentos pesados de PDF, OCR ou arquivos grandes devem usar Web Workers quando forem implementados.

Não adicionar PWA, service worker, suporte offline de assets ou geração de artefatos não solicitados. IndexedDB continua sendo a persistência local dos dados da aplicação, independentemente de PWA.

## Design System

Todo elemento visual reutilizável deve ficar em `src/ui/design-system`. Antes de criar um componente ou estilo dentro de uma página, verificar se ele pertence ao Design System ou se já existe uma implementação reutilizável.

Organização obrigatória:

```text
src/ui/design-system/
├── assets/
│   ├── icons/
│   └── images/
├── fonts/
├── tokens/
│   ├── colors.css
│   ├── spacing.css
│   ├── typography.css
│   └── shape.css
├── components/
│   └── NomeDoComponente/
│       ├── NomeDoComponente.tsx
│       └── nome-do-componente.css
└── index.ts
```

Regras:

- usar tokens semânticos para cores, espaçamentos, tipografia, bordas, raios e sombras;
- não repetir valores visuais arbitrários em componentes e páginas quando existir um token adequado;
- colocar ícones e imagens reutilizáveis em `assets` e fontes locais em `fonts`;
- manter componentes acessíveis, tipados e independentes de regras de negócio;
- expor componentes públicos pelo `index.ts` do Design System;
- páginas devem compor componentes, não criar versões próprias de botão, campo, card ou outro elemento já existente;
- componentes específicos de uma única feature podem permanecer próximos da página até demonstrarem reutilização real;
- ao surgir repetição visual relevante, promover o componente ou padrão para o Design System;
- não adicionar bibliotecas externas de UI sem solicitação explícita.

## Regras financeiras essenciais

- Representar valores monetários como centavos inteiros, nunca como ponto flutuante.
- Não contar pagamento de fatura como gasto; usar as compras detalhadas do cartão.
- Não contar transferências entre contas próprias como receita ou gasto.
- Não contar aplicações como despesa.
- Contabilizar resgates como entrada de caixa e movimento interno, nunca como receita externa.
- Usar somente contas fixas efetivamente pagas nos totais realizados.
- Tratar salário por competência, preservando a data real da transação.
- Não inferir categorias desconhecidas. Criar uma pendência para decisão do usuário.
- Permitir salvar uma decisão manual como regra de classificação para importações futuras.
- Não reclassificar fechamentos anteriores silenciosamente.
- Um fechamento confirmado deve guardar um snapshot das transações, classificações, contas fixas, meta e fórmulas/versões relevantes.
- Toda métrica do dashboard deve ser rastreável até as transações que a compõem.

Quando uma heurística não for conclusiva, retornar um estado explícito de revisão, em vez de escolher uma interpretação arbitrária.

## Persistência e privacidade

- Usar IndexedDB/Dexie como fonte de dados local.
- Armazenar o hash e os metadados mínimos do arquivo para detectar importações duplicadas.
- Descartar o conteúdo original do arquivo depois que a importação for confirmada.
- Não registrar descrições, valores ou outros dados financeiros sensíveis em analytics ou logs externos.
- Evoluções do schema local devem possuir migração explícita e validação prática antes da entrega.
- Backup restaurado deve ser validado integralmente antes de modificar o banco local.

## Qualidade

Nesta fase do produto, não criar nem manter infraestrutura de testes automatizados, arquivos `*.test.*`, `*.spec.*`, mocks, fixtures ou dependências dedicadas a testes. Priorizar velocidade de desenvolvimento e validação prática dos fluxos.

Não executar por iniciativa própria:

- servidor de desenvolvimento;
- reload ou inspeção no navegador;
- checagem de tipos;
- lint ou formatação global;
- build;
- auditoria de dependências;
- geração de artefatos;
- qualquer outra validação automatizada ou manual.

Executar validações somente quando o usuário pedir explicitamente. O usuário é responsável por subir o ambiente Vite, usar hot reload e conferir o comportamento durante o desenvolvimento.

Ao concluir uma mudança, informar sucintamente o que foi alterado e o estado do Git, sem iniciar uma rodada de validação. Não modificar arquivos sem relação com a tarefa apenas para satisfazer formatadores ou ferramentas.

Manter as regras financeiras em funções puras e com entradas e saídas explícitas para preservar a possibilidade de adicionar testes no futuro sem exigir refatoração estrutural agora.

Evitar abstrações antecipadas para múltiplos usuários, backend, sincronização ou formatos bancários ainda não solicitados. Manter interfaces extensíveis quando isso não adicionar complexidade relevante ao incremento atual.

## Fluxo Git obrigatório

A branch `main` é protegida por convenção e representa a base atual do projeto.

- Nunca alterar, fazer commit ou push diretamente na `main`.
- Nunca executar `git push` sem autorização explícita do usuário, independentemente da branch.
- Nunca integrar uma feature na `main` sem autorização explícita.
- Não criar Pull Request por padrão. Criar PR somente quando o usuário solicitar explicitamente.
- Não reescrever histórico, fazer force push ou usar comandos destrutivos sem autorização explícita.
- Por padrão, deixar as alterações sem commit para que o usuário possa revisar o diff. Fazer commit somente quando solicitado.

Ao iniciar uma nova feature ou um novo chat que exija mudanças:

1. verificar o estado atual do repositório;
2. preservar quaisquer mudanças locais existentes do usuário;
3. se a branch atual for `main`, criar uma feature branch antes da primeira edição;
4. usar o formato `feat-nome-breve-da-feature`, em minúsculas e com hífens;
5. se já estiver em uma feature branch relacionada à tarefa, continuar nela;
6. se houver dúvida sobre reaproveitar ou criar uma branch, perguntar antes de alterar arquivos;
7. ao concluir, apresentar resumo, arquivos modificados e estado do Git;
8. aguardar a revisão do usuário;
9. após aprovação explícita para integrar, fazer commit das mudanças aprovadas, rebasear a feature sobre a `main` e integrar localmente por fast-forward;
10. não fazer push da feature nem da `main` sem autorização explícita.

Fluxo local esperado após a aprovação:

```text
feature branch
→ commit das mudanças aprovadas
→ rebase sobre main
→ main
→ merge --ff-only da feature
→ aguardar autorização separada para push
```

Não criar merge commits no fluxo normal. Se o rebase produzir conflito ou se o fast-forward não for possível, interromper o fluxo e explicar a situação antes de prosseguir.

Correções isoladas podem usar `fix-nome-breve-da-correcao` quando o usuário caracterizar explicitamente o trabalho como correção. Na dúvida, usar `feat-...`.

## Forma de colaboração

O usuário possui experiência sênior em engenharia de software e iOS, além de familiaridade com npm, React e desenvolvimento web. Preferir comunicação prática, decisões explícitas, trade-offs concretos e referências ao impacto arquitetural. Evitar explicações introdutórias longas quando uma orientação direta for suficiente.

Antes de expandir materialmente o escopo, confirmar a decisão com o usuário. Para implementações já bem definidas, avançar autonomamente dentro destas regras e entregar as mudanças para revisão, sem validá-las por iniciativa própria.
