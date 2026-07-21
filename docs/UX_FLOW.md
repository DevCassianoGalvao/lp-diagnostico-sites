# UX Flow

## Principio

Uma etapa, uma pergunta e uma decisao principal por vez. A complexidade permanece no motor; a interface revela apenas o necessario.

## Estados da experiencia

| Momento | Conteudo visivel | Acao principal | Acao secundaria | Conteudo oculto |
| --- | --- | --- | --- | --- |
| Apresentacao | Logo, foto real, nome, funcao, prova, texto curto | Comecar analise | Retomar sessao, quando existir | Perguntas, resumo, recomendacao |
| Orientacao | Explicacao curta e duracao aproximada | Vamos comecar | Voltar | Diagnostico e resultado |
| Pergunta | Progresso, etapa, pergunta, apoio, resposta, navegacao | Continuar | Voltar, Ver respostas | Insights extensos e recomendacao |
| Microfeedback | Resposta compreendida e insight curto | Proxima pergunta | Voltar | Resumo e recomendacao |
| Processamento | Montagem abstrata de blocos por ate 1,5s | Nenhuma | Nenhuma | Resultado ate concluir a transicao |
| Resultado | Contexto, recomendacao, modulos, prioridades, resumo e contato | Salvar contato | Revisar respostas | Nenhum conteudo prematuro |
| Conversao | Confirmacao e CTA contextual | Abrir WhatsApp | Editar contato/respostas | CTA antes da validacao |

## Ordem das etapas

1. Apresentacao pessoal.
2. Introducao ao diagnostico.
3. Nome.
4. Negocio ou marca pessoal.
5. Nicho.
6. Alcance, quando aplicavel.
7. Situacao atual.
8. Objetivo principal.
9. Canal de aquisicao.
10. Modelo de decisao.
11. Nivel de estrutura.
12. Investimento opcional.
13. Prazo.
14. Processamento.
15. Recomendacao e captura.
16. Confirmacao e WhatsApp.

O total exibido acompanha apenas perguntas visiveis. A etapa condicional de alcance entra ou sai sem exibir um numero impossivel.

## Wireframes textuais

### Tela de apresentacao

```text
Header compacto: logo | Cassiano Galvao · Web Designer

Foto real em destaque moderado
Eyebrow curto
Prazer, eu sou Cassiano.
Apresentacao em dois paragrafos curtos
Prova: design desde 2010 · mais de 200 websites
[ Comecar analise ]

Retomar analise salva, quando aplicavel
```

### Tela de orientacao

```text
Header compacto

Indicador discreto: antes de comecar
Vou fazer algumas perguntas rapidas.
Explicacao da recomendacao inicial
Icone de relogio + aproximadamente 2 minutos
[ Voltar ] [ Vamos comecar ]
```

### Tela de pergunta

```text
Header compacto

Etapa 03 de 11                    [ Ver respostas ]
Barra fina de progresso

Pergunta principal
Texto de apoio, se necessario

Opcoes em uma coluna
ou duas colunas apenas para textos curtos

Microfeedback curto, apos selecao estrategica
Mensagem de erro somente apos tentativa

[ Voltar ]                         [ Continuar ]
```

### Resumo sob demanda

```text
Overlay
Drawer desktop / sheet mobile
Minhas respostas                         [ Fechar ]

Somente etapas respondidas
Rotulo da pergunta
Resposta humana                          [ Editar ]

[ Recomecar analise ]
```

### Processamento

```text
Organizando sua recomendacao...
Tres blocos conectados em sequencia curta
Mensagem acessivel em aria-live
```

### Resultado

```text
Recomendacao inicial
Titulo personalizado
Contexto identificado

Estrutura recomendada
Itens principais

Prioridades e modulos condicionais
Resumo recolhivel das respostas

Formulario de contato
[ Revisar respostas ] [ Salvar contato ]

Apos validacao:
Confirmacao
[ Abrir conversa no WhatsApp ]
```

## Interacoes e validacoes

- Continuar permanece desabilitado sem resposta obrigatoria.
- Se o usuario tentar enviar texto incompleto, o erro aparece junto do campo e recebe foco logico.
- Selecao nao avanca automaticamente; ela ativa Continuar e mostra estado claro.
- Enter avanca em perguntas de texto quando validas; Space/Enter selecionam opcoes nativas.
- Escape fecha o resumo e devolve foco ao botao que o abriu.
- Editar no resumo fecha o painel, leva a etapa correspondente e recalcula o resultado em memoria.
- Ao mudar nicho para um valor sem alcance, limpar `alcance` e `cidade`.
- Ao mudar uma opcao com campo Outro, limpar o texto livre anterior quando ele deixa de ser aplicavel.
- Recomeçar exige confirmacao leve quando houver respostas.
- Erros de contato aparecem apenas apos envio.

## Microfeedback

Usar `ack` ja existente, com no maximo dois paragrafos curtos. Mostrar apenas depois de uma selecao e somente na etapa atual. Nao persistir cards de etapas anteriores.

## Transicoes

- Entrada de tela: 320ms, opacidade e deslocamento de 12px.
- Selecao: 180ms, sem bloquear clique.
- Barra: 350ms.
- Drawer/sheet: 300ms.
- Processamento: 1,2s; em reduced motion, concluir quase imediatamente.
- Foco vai para o titulo principal da nova etapa apos a transicao.

## Mobile

- Padding horizontal de 20px; 24px a partir de 430px.
- Header com logo e identificacao curta; sem metrica permanente.
- Todas as opcoes em uma coluna e altura minima de 52px.
- Navegacao no fluxo normal, sem footer fixo cobrindo conteudo.
- Resumo em tela sobreposta com area segura e rolagem propria.
- Titulo de pergunta entre 30px e 38px, com linhas controladas.
- Sem grade decorativa intensa, blur pesado ou rolagem horizontal.
