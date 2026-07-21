# Cassiano Galvao | Landing Conversacional

Landing page conversacional e adaptativa para qualificar leads de projetos de sites, landing pages e estruturas digitais.

O redesign organiza a experiencia em apresentacao, orientacao, perguntas, processamento e resultado. A interface usa Space Grotesk como fonte principal e IBM Plex Mono apenas em pequenos indicadores.

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

Use o formulario interativo e combine:

- Saude + Instagram + agendamento.
- Juridico + autoridade + pesquisa.
- Servico local + orcamento + Google.
- Consultoria + trafego pago + reuniao.
- Comercio + catalogo + WhatsApp.
- Nicho Outro + objetivo Outro.
- Site desatualizado + redesign.
- Sessao salva: responda algumas perguntas, recarregue e continue.

Verificacao importante: nenhuma jornada deve recomendar e-commerce, carrinho, checkout ou pagamento online.

## Publicacao no cPanel

O site e publicado em `https://cassianogalvao.com.br/lp/`. O build fica em `dist/`, unica pasta copiada para `public_html/lp` pela configuracao `.cpanel.yml`.

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
