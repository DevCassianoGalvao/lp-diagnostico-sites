# Cassiano Galvão | Diagnóstico de Sites

Diagnóstico conversacional para captar e qualificar interessados em sites profissionais.

O fluxo usa captura progressiva, leitura sobre Google, prova de portfólio relacionada ao nicho e resultado com oferta do Site Profissional Essencial por R$ 497. Funcionalidades adicionais podem alterar o orçamento após a conversa de definição do projeto.

## Como instalar

```bash
npm.cmd install
```

## Como executar

```bash
npm.cmd run dev
```

## Como gerar build

```bash
npm.cmd run build
```

## Onde alterar

- Cores e tokens: `src/styles/global.css`
- WhatsApp: `src/services/whatsapp.ts`
- Perguntas: `src/content/questions.ts`
- Taxonomia e projetos: `src/content/portfolio.ts`
- Recomendacoes: `src/content/recommendations.ts`
- Regras: `src/rules/recommendation-engine.ts`
- Eventos: `src/analytics/events.ts`
- Logo/foto: `public/assets/brand` e `public/assets/photo`

## Documentacao de UX

- Auditoria: `docs/UI_UX_AUDIT.md`
- Fluxo e wireframes: `docs/UX_FLOW.md`
- Sistema visual: `docs/DESIGN_SYSTEM.md`

## Assets

Foram usados assets reais do site atual `www.cassianogalvao.com.br`:

- Logo: `public/assets/brand/logo-cassiano.svg`
- Foto: `public/assets/photo/cassiano-galvao.jpg`

Nao foram criados logo, depoimentos, metricas ou projetos ficticios.

## Como testar jornadas

Use o formulário interativo e valide:

- Serviço local + cidade + sem site + concorrentes no Google + caminho de R$ 497.
- Jurídico + autoridade + mais páginas.
- Saúde + agendamento + recursos adicionais.
- Outro: deve mostrar somente projetos marcados como `outro`.
- Tecnologia: não deve aparecer sem case associado.
- Abandono após captura: contato e respostas permanecem apenas na sessão local; o Brevo dispara uma única notificação ao concluir o diagnóstico.
- Sessão antiga: chave v1 ignorada; sessão v2 recuperada sem etapa incompatível.

Os nichos públicos são derivados dos projetos reais em `portfolioProjects`. A prova rápida filtra correspondências exatas e mostra no máximo três cases, sem links externos.

Regra pública: usar “site”, “site profissional” ou “site profissional em uma página”. Não usar “landing page” na interface do empresário. Nenhuma jornada deve recomendar e-commerce, carrinho, checkout ou pagamento on-line.

## Publicacao no cPanel

O site e publicado em `https://cassianogalvao.com.br/lp/`. O build fica em `dist/`, unica pasta copiada para `$HOME/cassianogalvao.com.br/lp/` pela configuracao `.cpanel.yml`.

Fluxo de publicacao:

1. Execute `npm.cmd run build` localmente.
2. Versione a pasta `dist/` junto com o codigo.
3. Envie a branch `main` para o GitHub.
4. No Git Version Control do cPanel, atualize o repositorio e use `Deploy HEAD Commit`.

O cPanel exige o arquivo `.cpanel.yml` versionado e uma arvore de trabalho limpa para liberar o deploy.

## Brevo

O endpoint PHP esta em `public/api/leads.php`. A chave nunca deve ser adicionada ao Git. No servidor, crie o arquivo privado:

`$HOME/.config/cassiano-lp-brevo.php`

Use `config/brevo.example.php` como modelo. O arquivo real precisa conter a chave da API, o remetente verificado e o e-mail que recebera as notificacoes.

Antes de publicar, confirme tambem:

- Numero real do WhatsApp em `src/services/whatsapp.ts`.
- Politica de privacidade real.
- IDs reais de analytics fora do codigo-fonte ou em configuracao de ambiente.
- Cases reais com imagens/URLs autorizadas, se forem exibidos.
