# Design System

## Principios visuais

- Premium, humano e tecnologico.
- Preto como campo principal; cor aparece para orientar acao e estado.
- Tipografia e espaco criam hierarquia antes de bordas.
- Uma superficie principal por tela; caixas apenas quando agrupam informacao real.
- Futurismo discreto: linhas finas, pequenos indicadores e movimento funcional.

## Tipografia

### Primaria

`Space Grotesk`, pesos 400, 500, 600 e 700.

- 400: textos e explicacoes.
- 500: controles e navegacao.
- 600: perguntas, opcoes e subtitulos.
- 700: titulos principais.

### Secundaria

`IBM Plex Mono`, pesos 500 e 600, apenas em:

- Eyebrows.
- Numero da etapa.
- Status curto.
- Indicadores de progresso.
- Metadados pequenos.

Nunca usar mono em paragrafos, perguntas, opcoes ou titulos grandes.

### Escala

| Uso | Desktop | Mobile | Peso |
| --- | --- | --- | --- |
| Titulo de apresentacao | `clamp(42px, 5vw, 68px)` | 40px | 700 |
| Pergunta | `clamp(32px, 4vw, 52px)` | `clamp(30px, 9vw, 38px)` | 600 |
| Titulo de resultado | `clamp(34px, 4vw, 54px)` | 34px | 700 |
| Subtitulo | 24px a 28px | 22px | 600 |
| Apoio | 18px a 20px | 16px a 18px | 400 |
| Opcao | 17px | 16px | 500/600 |
| Botao | 16px | 16px | 600 |
| Label mono | 12px a 13px | 12px | 600 |

Comprimento recomendado: 52 a 68 caracteres em textos e no maximo 18 palavras confortaveis em titulos principais.

## Cores

| Token | Valor | Uso |
| --- | --- | --- |
| `--bg` | `#050505` | Fundo principal |
| `--surface` | `#0D0D0F` | Superficie principal |
| `--surface-raised` | `#141417` | Opcao e drawer |
| `--text` | `#F7F7F8` | Texto principal |
| `--text-soft` | `#C8C8CE` | Texto secundario |
| `--text-muted` | `#8D8D96` | Metadados |
| `--border` | `rgba(255,255,255,.12)` | Divisores pontuais |
| `--purple` | `#8928FF` | CTA, selecao, marca |
| `--purple-hover` | `#9D4AFF` | Hover de CTA |
| `--purple-soft` | `rgba(137,40,255,.14)` | Fundo selecionado |
| `--green` | `#00EF9E` | Progresso, confirmacao, sucesso |
| `--green-soft` | `rgba(0,239,158,.10)` | Feedback positivo |
| `--danger` | `#FF8F98` | Erro apos tentativa |

Regra cromatica: roxo conduz escolha e acao; verde confirma progresso e conclusao. Nao usar ambos como destaque dominante no mesmo componente.

## Espacamento

Escala fixa: `4, 8, 12, 16, 24, 32, 48, 64, 80, 96px`.

- Header para conteudo: 48 a 80px.
- Etapa para pergunta: 16 a 24px.
- Pergunta para apoio: 12 a 16px.
- Apoio para respostas: 32px.
- Entre respostas: 12 a 16px.
- Respostas para navegacao: 32 a 40px.
- Padding lateral mobile: 20 a 24px.

## Layout e breakpoints

- Conteudo de conversa: `min(100% - 40px, 860px)`.
- Resultado: `min(100% - 40px, 980px)`.
- Apresentacao: ate 1120px, composicao assimetrica simples.
- `360px`, `390px`, `430px`: mobile de uma coluna.
- `768px`: tablet, ainda sem sidebar.
- `1024px`: desktop compacto.
- `1440px`: desktop amplo com espaco negativo maior.

## Componentes

### Header

- Altura visual entre 56 e 68px.
- Sem caixa pesada; fundo translúcido discreto quando sticky.
- Logo real a esquerda; identificacao curta a direita.

### Botao principal

- Roxo solido, texto branco, altura minima 52px.
- Raio 8px, sem formato de pilula exagerado.
- Hover com leve elevacao e `--purple-hover`.
- Focus com outline branco/roxo visivel.
- Disabled com opacidade e cursor coerentes, sem sombra.

### Botao secundario

- Transparente, texto suave, borda apenas quando necessaria.
- Nunca competir em peso com o CTA.

### Opcao

- Botao semantico em grupo de escolha unica.
- Altura minima 56px; padding 16px a 18px.
- Padrao: superficie elevada e borda discreta.
- Hover: borda mais clara.
- Selecionado: fundo roxo suave, borda roxa e check outline.
- Focus: outline independente da cor de selecao.
- Pressionado: escala maxima de 0.99.
- Disabled: contraste reduzido, mantendo legibilidade.

### Inputs

- Label visivel.
- Superficie escura, borda discreta, raio 8px.
- Altura minima 54px.
- Focus com borda roxa e halo curto.
- Erro somente apos tentativa, associado por `aria-describedby`.

### Microfeedback

- Sem card grande.
- Linha ou icone verde, fundo verde muito leve e texto curto.
- Entrada de 200 a 300ms.

### Drawer e bottom sheet

- Overlay preto translucido.
- Desktop: largura maxima 440px, lateral direita.
- Mobile: ocupa a tela com topo arredondado apenas quando sheet; preferir overlay total em alturas pequenas.
- Trap de foco, Escape para fechar e retorno de foco.

### Resultado

- Blocos separados por espacamento e divisores, evitando cards aninhados.
- Recomendacao principal tem maior peso; modulos sao lista escaneavel.
- Contato aparece depois da entrega de valor.

## Iconografia

Usar Lucide outline em 18, 20 ou 24px. Icones complementam rotulos; botoes icon-only exigem tooltip e nome acessivel.

## Movimento

- Microinteracao: 150 a 250ms.
- Transicao de etapa: 300 a 500ms.
- Drawer: 300ms.
- Processamento: ate 1,5s.
- Easing padrao: `power2.out`.
- Sem movimento continuo, glitch, typing lento ou scroll automatico.
- Com `prefers-reduced-motion`, remover deslocamento e reduzir duracoes a quase zero.

## Acessibilidade

- Contraste minimo WCAG AA.
- Foco sempre visivel.
- Ordem de tabulacao acompanha a leitura.
- Estados selecionados usam check, borda e fundo.
- Regioes dinamicas usam `aria-live` sem anunciar cada detalhe visual.
- Dialogos recebem nome, foco inicial, Escape e retorno de foco.
- Alvos de toque com no minimo 48px.
