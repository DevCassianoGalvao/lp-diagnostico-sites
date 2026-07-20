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

- Auditoria: `UI_UX_AUDIT.md`
- Fluxo e wireframes: `UX_FLOW.md`
- Sistema visual: `DESIGN_SYSTEM.md`

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

## Publicacao

O build fica em `dist/`. Antes de publicar, configure:

- Numero real do WhatsApp em `src/services/whatsapp.ts`.
- Politica de privacidade real.
- IDs reais de analytics fora do codigo-fonte ou em configuracao de ambiente.
- Cases reais com imagens/URLs autorizadas, se forem exibidos.
