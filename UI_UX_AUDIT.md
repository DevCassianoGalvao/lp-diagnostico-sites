# UI/UX Audit

## Escopo analisado

- Aplicacao React em rota unica, montada em `src/main.tsx`.
- Conteudo e perguntas em `src/content`.
- Estado e persistencia em `src/state`.
- Motor deterministico em `src/rules/recommendation-engine.ts`.
- Analytics, WhatsApp, validacao, sanitizacao e CSS global.
- Fluxos desktop, mobile, teclado, retorno de sessao e resultado.

## Diagnostico executivo

A camada logica esta corretamente separada da recomendacao, mas a interface apresenta o estado interno como se fosse um painel. O problema nao e falta de acabamento: e arquitetura de atencao. Pergunta, resumo, recomendacao preliminar e insights competem no mesmo momento.

O redesign deve transformar a pagina em uma maquina de estados visuais: apresentacao, orientacao, pergunta, microfeedback, processamento e resultado. Em cada estado existe uma acao principal.

## Achados

| Prioridade | Problema | Impacto | Solucao recomendada |
| --- | --- | --- | --- |
| Critica | Sidebar fixa mostra resumo e recomendacao preliminar durante as perguntas | Divide atencao e antecipa valor antes da coleta completa | Remover sidebar; abrir respostas sob demanda em drawer/bottom sheet |
| Critica | Cards de insight permanecem abaixo da pergunta | Faz a experiencia parecer dashboard e alonga cada etapa | Converter acknowledgements estrategicos em microfeedback transitivo |
| Critica | Resultado e contato compartilham o mesmo estado `completed` | Nao existe processamento real nem separacao clara entre diagnostico e resultado | Criar fases explicitas sem alterar o motor de recomendacao |
| Alta | Hero enfatiza um diagrama abstrato antes da conexao pessoal | Retarda entendimento e reforca aparencia de sistema | Abrir com apresentacao pessoal, foto real, prova curta e CTA |
| Alta | IBM Plex Mono em todo o texto | Reduz conforto em textos longos e reforca rigidez tecnica | Space Grotesk como primaria; mono apenas para microindicadores |
| Alta | Botao Continuar parece ativo mesmo sem resposta | Estado de disponibilidade nao fica claro | Usar `disabled` real; validar apenas apos tentativa |
| Alta | Opcao selecionada depende muito de cor | Acessibilidade e reconhecimento insuficientes | Combinar fundo, borda, check e `aria-pressed` |
| Alta | `role=listbox` com botoes nao implementa o comportamento completo de listbox | Semantica e navegacao por teclado ficam inconsistentes | Usar grupo de botoes com `role=radiogroup` e rotulos acessiveis |
| Alta | Edicao de respostas so existe por voltar linearmente | Revisao e correcao sao lentas | Drawer com respostas concluidas e acao Editar por etapa |
| Media | Etapa exibida pelo id tecnico e progresso em porcentagem | Orientacao pouco humana | Mostrar `Etapa n de total` e barra fina proxima da pergunta |
| Media | Mensagem de salvamento ocupa espaco permanente | Exibe detalhe tecnico sem ajudar a decisao | Manter `aria-live` discreto e mostrar apenas mudanca ou falha |
| Media | Layout usa muitas bordas, caixas e grade de fundo | Alto ruido e baixa hierarquia | Superficies amplas, poucas bordas e contraste por espacamento |
| Media | Perguntas longas e personalizacao repetitiva | Conversa soa automatizada | Encurtar microcopy e reservar nome para momentos-chave |
| Media | Nao existe tela de introducao curta ao diagnostico | Transicao abrupta entre apresentacao e formulario | Adicionar tela de 2 minutos com CTA claro |
| Media | Nao existe processamento visual | Resultado aparece abruptamente | Transicao de 1,2 segundo com blocos abstratos e reduced motion |
| Media | WhatsApp aparece antes de contato validado | Enfraquece captura e consentimento | Liberar CTA apos envio local valido |
| Media | `recommendation_view` esta documentado, mas nao dispara | Lacuna de mensuracao | Disparar uma vez quando o resultado entrar |
| Baixa | JSON-LD fica dentro do corpo React | Metadado funciona de forma pouco convencional | Mover schema para `index.html` em etapa posterior de SEO |
| Bloqueio de publicacao | Numero de WhatsApp ainda e placeholder | CTA nao pode ser tratado como canal real | Manter aviso tecnico e exigir numero real antes de divulgacao publica |

## O que sera preservado

- Estrutura `Lead` e chaves de resposta.
- Perguntas, opcoes, regras condicionais e campos Outro.
- `getRecommendation` e suas prioridades.
- Modulos condicionais e ausencia de e-commerce.
- Chave e formato atual de persistencia, com compatibilidade de sessao.
- Eventos existentes e regra de nao enviar dados pessoais.
- Geracao contextual da mensagem do WhatsApp.
- Assets reais de logo e foto.

## Riscos de regressao

- Editar nicho pode retirar a pergunta de alcance; respostas de alcance e cidade devem ser limpas quando deixarem de ser compativeis.
- Uma sessao antiga pode apontar para um indice maior que a nova lista visivel; o indice deve ser normalizado.
- Pergunta opcional precisa permitir continuar sem selecao, mas continuar desabilitado nas obrigatorias.
- O CTA de WhatsApp nao deve aparecer como funcional enquanto o numero estiver em placeholder.
- Animacoes nao podem bloquear foco, clique ou leitura com reduced motion.

## Direcao recomendada

Interface central de 760 a 920px, sem sidebar. Cabecalho compacto, preto predominante, Space Grotesk para leitura, roxo para acao e selecao, verde para progresso e confirmacao. Microfeedback curto substitui os cards persistentes. Resumo oculto abre como drawer no desktop e bottom sheet/tela sobreposta no mobile.
