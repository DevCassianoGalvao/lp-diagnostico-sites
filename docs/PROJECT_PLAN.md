# PROJECT_PLAN.md

## 1. Inventario inicial

Arquivos encontrados na raiz do projeto:

- `landing_conversacional_copy_completa_v1.1.docx`

Arquivos ainda nao encontrados:

- Logo oficial.
- Foto profissional do Cassiano.
- Imagens autorizadas de projetos/cases.
- Depoimentos reais autorizados.
- Politica de privacidade.
- Stack front-end existente.
- Configuracao de hospedagem, endpoint, CRM ou WhatsApp final.

Conclusao: o projeto ainda nao possui implementacao. A primeira decisao tecnica sera criar uma base Vite + TypeScript leve, com GSAP, sem framework pesado, a menos que algum arquivo novo indique stack diferente antes da implementacao.

## 2. Fonte estrategica analisada

Documento base lido:

- `landing_conversacional_copy_completa_v1.1.docx`

Conteudo identificado:

- 486 paragrafos.
- 195 tabelas.
- Fluxo conversacional completo.
- Opcoes de resposta com acknowledgements, blocos gerados e regras.
- Matriz de recomendacao.
- Modulos condicionais.
- CTAs finais.
- Mensagens de WhatsApp.
- Eventos de analytics.
- Exemplos de jornadas.
- Regras de fallback e estados.

O documento sera tratado como fonte principal de conteudo, mas nao como transcricao literal. Ajustes relevantes de copy deverao ser registrados em `COPY_DECISIONS.md`.

## 3. Problemas e lacunas antes da implementacao

1. O briefing atual proibe e-commerce, checkout, carrinho e pagamento online. O DOCX menciona `checkout` em inscricoes e `pagamento` em atendimento online. Decisao: remover qualquer recomendacao de checkout/pagamento na V1. Para cursos/eventos, usar inscricao, formulario de interesse, WhatsApp ou contato orientado.

2. O DOCX lista cases reais por nome, mas nao ha imagens, URLs, permissoes ou detalhes completos dos cases. Decisao: criar estrutura tecnica para cases, mas nao exibir case incompleto como prova visual falsa. Exibir apenas cases com dados seguros e sem metricas inventadas.

3. Nao ha logo/foto na pasta. Decisao: preparar slots de asset e fallback visual neutro baseado em texto, sem criar logotipo ficticio.

4. Nao ha numero de WhatsApp final. Decisao: centralizar em configuracao (`src/config/site.ts`) com placeholder tecnico nao exposto como dado real.

5. Faixas de investimento do DOCX podem nao refletir posicionamento comercial atual. Decisao: implementar como opcional e facil de editar; antes de publicar, validar valores reais.

6. Backend/CRM nao definido. Decisao: V1 pode salvar localmente, preparar servico de envio desacoplado e fallback para WhatsApp. Endpoint PHP/cPanel fica preparado como opcao, nao assumido.

## 4. Objetivo da experiencia

Construir uma landing page conversacional adaptativa que:

- Apresente `Cassiano Galvao | Web Designer`.
- Comunique design desde 2010 e mais de 200 websites entregues.
- Crie conexao humana antes do diagnostico.
- Colete respostas progressivamente.
- Monte blocos visuais condicionais conforme estado do lead.
- Gere recomendacao personalizada sem IA decisoria.
- Capture contato somente apos entregar valor.
- Abra WhatsApp com mensagem contextual.
- Prepare mensuracao para Meta Ads, GA/GTM e eventos internos.

Nao sera:

- Formulario longo tradicional.
- E-commerce.
- Vitrine de efeitos vazios.
- Promessa de resultado nao comprovado.
- Posicionamento arrogante como "o melhor" ou "o cara dos sites".

## 5. Fluxo principal

1. Entrada/hero.
2. Retorno de sessao, se existir progresso salvo.
3. Apresentacao pessoal.
4. Nome.
5. Nome do negocio ou marca pessoal/projeto indefinido.
6. Nicho.
7. Alcance, condicional por nicho.
8. Cidade/regiao, condicional por alcance local.
9. Situacao digital atual.
10. Objetivo principal.
11. Origem atual dos clientes.
12. Modelo de decisao/venda.
13. Nivel de estrutura.
14. Faixa de investimento opcional.
15. Prazo/intencao.
16. Captura de contato e consentimento.
17. Resultado final com recomendacao, modulos, case aplicavel, processo e CTA.

Ritmo visual:

- Lead responde uma pergunta curta.
- Pagina reconhece a resposta.
- Novo bloco entra e permanece visivel.
- Resumo do diagnostico e estrutura recomendada sao atualizados.
- Proxima pergunta aparece sem trocar toda a tela.
- Resultado final reorganiza os blocos em narrativa coerente.

## 6. Perguntas e respostas mapeadas

### Nome

- Campo: primeiro nome.
- Validacoes: vazio, um caractere, nome longo.
- Saida: saudacao e placa "analise em construcao".

### Negocio

- Nome informado.
- Uso meu proprio nome.
- Ainda nao defini.

### Nicho

- Saude e bem-estar.
- Estetica e beleza.
- Juridico.
- Servicos profissionais e consultoria.
- Servicos locais e manutencao.
- Educacao, cursos e eventos.
- Imobiliario, arquitetura e construcao.
- Comercio, lojas fisicas e marcas.
- Tecnologia e software.
- Outro, com campo livre sanitizado.

### Alcance

Exibir para saude, juridico, consultoria, servicos locais, imobiliario, educacao e negocios hibridos.

- Cidade ou regiao proxima.
- Varias cidades da regiao.
- Todo o Brasil.
- Atendimento 100% online.
- Local e online.
- Campo de cidade quando local.

### Situacao digital atual

- Ainda nao tenho site.
- Tenho site, mas esta desatualizado.
- Tenho site, mas quase nao recebo contatos.
- Dependo principalmente do Instagram.
- Anuncio, mas a pagina nao converte.
- Quero lancar novo servico, produto ou evento.
- Tenho produtos, mas dependo de catalogo/redes/atendimento manual.
- Outro momento, com campo livre.

### Objetivo principal

- Gerar contatos no WhatsApp.
- Receber pedidos de orcamento.
- Agendar atendimentos ou reunioes.
- Fortalecer autoridade e credibilidade.
- Apresentar melhor meus servicos.
- Apresentar produtos e receber pedidos.
- Captar inscricoes para curso ou evento.
- Organizar meu processo comercial.
- Outro objetivo, com campo livre.

### Origem atual dos clientes

- Indicacao.
- Instagram ou outras redes sociais.
- Google e pesquisas.
- Trafego pago.
- Prospeccao ativa.
- Marketplaces ou plataformas de terceiros.
- Ainda nao tenho canal consistente.
- Outro canal, com campo livre.

### Modelo de decisao/venda

- Pessoa decide rapido e chama.
- Pessoa compara opcoes e pesquisa bastante.
- Precisa falar comigo ou participar de uma reuniao.
- Precisa pedir orcamento.
- Pessoa escolhe produto e entra em contato para pedir/comprar.
- Ainda nao tenho processo definido.

### Nivel de estrutura

- Algo essencial para comecar certo.
- Solucao profissional e personalizada.
- Estrutura completa de captacao e organizacao.
- Ainda nao sei e quero orientacao.

### Investimento opcional

- Ate R$ 1.500.
- De R$ 1.500 a R$ 3.000.
- De R$ 3.000 a R$ 6.000.
- Acima de R$ 6.000.
- Ainda nao defini.

### Prazo

- O quanto antes.
- Nas proximas 4 semanas.
- Entre 1 e 3 meses.
- Ainda estou pesquisando.

### Contato

- WhatsApp obrigatorio.
- E-mail opcional.
- Consentimento obrigatorio.
- Validacoes para WhatsApp, e-mail e consentimento.

## 7. Motor de recomendacao

Prioridade dos sinais:

1. Objetivo principal define tipo de conversao.
2. Modelo de venda define profundidade da jornada.
3. Situacao atual define novo projeto, redesign ou otimizacao.
4. Nicho define linguagem, provas, funcionalidades e cuidados.
5. Canal atual define entrada e mensuracao.
6. Nivel/investimento ajustam primeira fase.
7. Prazo ajusta CTA e abordagem, sem prometer qualidade diferente.

Recomendacoes principais:

- Landing Page de Conversao.
- Site Institucional Estrategico.
- Site de Autoridade e Conteudo.
- Site de Servicos com Orcamento Inteligente.
- Site com Agendamento ou Pre-atendimento.
- Site-vitrine e Catalogo de Produtos.
- Pagina de Lancamento, Evento ou Inscricao.
- Redesign e Otimizacao.
- Site + Funil de Captacao.
- MVP Essencial.

Regras-chave:

- `objetivo = catalogo_produtos` -> Site-vitrine/Catalogo.
- `objetivo = inscricoes` -> Pagina de Lancamento/Inscricao, sem checkout na V1.
- `situacao = site_desatualizado` -> Redesign e Otimizacao.
- `objetivo = orcamento` -> Site de Servicos + Orcamento.
- `objetivo = agendamento` -> Site com Agendamento.
- `objetivo = organizar_comercial` -> Site + Funil.
- `objetivo = whatsapp` + `modeloVenda = decisao_rapida` -> Landing de Conversao.
- `objetivo in autoridade/apresentar_servicos` -> Site Institucional ou Autoridade.
- Fallback -> MVP Essencial.

Modificadores:

- SEO local: alcance local/regional.
- Trafego e mensuracao: canal trafego pago ou pagina nao converte.
- Qualificacao e CRM: reuniao/orcamento/organizar comercial.
- Autoridade: objetivo autoridade ou nichos profissionais.
- Rede social para estrutura propria: depende do Instagram.
- Conteudo e SEO: Google ou jornada longa.
- Automacao responsavel: nivel completo.

## 8. Arquitetura proposta

```text
src/
  assets/
  components/
    common/
    questions/
    sections/
    recommendation/
  content/
    copy.ts
    questions.ts
    recommendations.ts
    cases.ts
    faq.ts
  state/
    lead-state.ts
    persistence.ts
  rules/
    visibility-rules.ts
    recommendation-engine.ts
    component-registry.ts
  analytics/
    config.ts
    events.ts
  animations/
    gsap.ts
  services/
    lead-submit.ts
    whatsapp.ts
  styles/
    tokens.css
    global.css
  utils/
    sanitize.ts
    validators.ts
    formatters.ts
```

Principios:

- Copy fora dos componentes visuais.
- Regras condicionais fora da camada de UI.
- Estado centralizado e persistido.
- Component registry para montar blocos reais conforme respostas.
- Analytics sem dados pessoais.
- Configuracao central para WhatsApp, tags e IDs.

## 9. Design system

Direcao visual:

- Fundo preto verdadeiro.
- Superficies escuras.
- Detalhes verdes e roxos.
- IBM Plex Mono.
- Contraste alto.
- Interface futurista, modular e limpa.

Elementos permitidos:

- Blocos que se encaixam.
- Nos ativados.
- Linhas conectando respostas e recomendacoes.
- Mini-diagramas de funil.
- Cards de estrutura.
- Indicadores de progresso.
- Etiquetas tecnicas discretas.

Evitar:

- Neon excessivo.
- Crypto/gamer/cyberpunk exagerado.
- Terminal gratuito.
- Glitch em excesso.
- Decoracao sem funcao.
- Logotipo ficticio.

Tokens globais:

- Cores.
- Tipografia.
- Espacamentos.
- Bordas.
- Raios.
- Sombras.
- Duracoes de animacao.
- Larguras maximas.
- Breakpoints.

## 10. Animacoes

Usar GSAP + ScrollTrigger para:

- Entrada de blocos condicionais.
- Sequencia de cards.
- Linhas/nos ativados.
- Atualizacao de progresso.
- Reorganizacao final da recomendacao.
- Reveals leves no scroll.

Regras:

- Respeitar `prefers-reduced-motion`.
- Nao usar scroll hijacking.
- Nao atrasar navegacao.
- Nao animar tudo ao mesmo tempo.
- Evitar mudancas bruscas de altura no mobile.

## 11. Captura, persistencia e WhatsApp

Persistencia:

- Salvar respostas no `localStorage`.
- Mostrar retorno de sessao.
- Permitir continuar, recomecar e editar respostas.
- Nao tratar sessao antiga como atual sem aviso.

Captura:

- WhatsApp obrigatorio.
- E-mail opcional.
- Consentimento obrigatorio.
- Protecao contra duplicidade e inputs maliciosos.
- Servico de envio desacoplado para futuro endpoint PHP/CRM.

WhatsApp:

- Mensagem personalizada com nome, negocio, nicho, situacao, objetivo, canal, modelo de venda, recomendacao e prazo.
- URL encoded.
- Sem dados sensiveis desnecessarios.

## 12. Analytics

Eventos iniciais a documentar em `ANALYTICS_EVENTS.md`:

- `page_view`
- `intro_view`
- `start_diagnosis`
- `answer_name`
- `answer_business`
- `answer_niche`
- `answer_current_situation`
- `answer_goal`
- `answer_acquisition_channel`
- `recommendation_view`
- `contact_form_view`
- `lead_submit`
- `qualified_lead`
- `whatsapp_click`
- `restart_diagnosis`
- `edit_answer`

Eventos do DOCX tambem mapeados:

- `experience_started`
- `identity_completed`
- `niche_selected`
- `context_completed`
- `funnel_completed`
- `recommendation_ready`
- `contact_started`
- `lead_submitted`
- `recommendation_viewed`
- `meeting_requested`
- `answers_edited`

Regra: nao enviar nome, e-mail, telefone ou texto livre para analytics.

## 13. SEO e acessibilidade

SEO:

- Title.
- Meta description.
- Canonical.
- Open Graph.
- Twitter Cards.
- Favicon.
- Schema `Person` e/ou `ProfessionalService`.
- Conteudo inicial rastreavel.
- Headings corretos.
- No keyword stuffing.

Acessibilidade:

- HTML semantico.
- Labels reais.
- Navegacao por teclado.
- Foco visivel.
- Contraste adequado.
- `aria-live` para atualizacoes importantes.
- Mensagens de erro claras.
- Icones com descricao quando necessario.
- Sem dependencia apenas de cor.

## 14. Documentacao a criar

- `README.md`
- `PROJECT_PLAN.md`
- `COPY_DECISIONS.md`
- `ANALYTICS_EVENTS.md`
- `CONTENT_MAP.md`

`CONTENT_MAP.md` devera relacionar pergunta, respostas, regra, blocos exibidos, recomendacao e CTA.

`COPY_DECISIONS.md` devera registrar qualquer ajuste relevante com:

- Texto original.
- Texto ajustado.
- Motivo estrategico.
- Etapa do funil.

## 15. Plano de implementacao

### Fase 1 - Base tecnica

- Criar Vite + TypeScript.
- Instalar GSAP.
- Criar tokens globais.
- Criar estado central do lead.
- Criar persistencia.
- Criar validadores/sanitizadores.
- Estruturar conteudo em arquivos separados.
- Criar motor de recomendacao.

### Fase 2 - Conversa e blocos dinamicos

- Implementar apresentacao inicial.
- Implementar question engine.
- Implementar componentes de resposta: botao, card, chip, campo, outro.
- Implementar blocos condicionais.
- Implementar voltar, editar e reiniciar.
- Garantir que cada resposta gere mudanca perceptivel.

### Fase 3 - Resultado e conversao

- Implementar recomendacao final.
- Implementar modulos condicionais.
- Implementar captura de contato.
- Implementar WhatsApp personalizado.
- Implementar fallback de envio.
- Preparar estrutura para CRM/endpoint.

### Fase 4 - UI, GSAP, responsividade

- Aplicar identidade black/verde/roxo.
- Inserir IBM Plex Mono.
- Implementar iconografia outline consistente.
- Implementar animacoes contextuais.
- Ajustar mobile primeiro.
- Testar reduced motion.

### Fase 5 - Analytics, SEO, testes e docs

- Criar config de analytics sem IDs reais.
- Criar eventos.
- Implementar metadados e schema.
- Criar README, CONTENT_MAP, ANALYTICS_EVENTS e COPY_DECISIONS.
- Testar jornadas obrigatorias.
- Verificar console, links, mobile, acessibilidade e build.

## 16. Testes obrigatorios

Jornadas:

- Profissional da saude.
- Advogado.
- Prestador de servico local.
- Consultor.
- Empresa B2B.
- Profissional autonomo.
- Negocio sem site.
- Site desatualizado.
- Dependencia do Instagram.
- Trafego pago sem conversao.
- Captacao de contatos.
- Produtos sem e-commerce.
- Nicho "Outro".
- Respostas incompletas.
- Retorno de sessao anterior.
- Alteracao de resposta.
- Falha no envio do formulario.

Checks:

- Nenhuma jornada recomenda e-commerce.
- Nenhum placeholder visivel como se fosse conteudo real.
- Nenhum depoimento ou metrica inventada.
- WhatsApp URL encoded.
- Eventos sem dados pessoais.
- Build sem erro.
- Console sem erro.
- Sem rolagem horizontal no mobile.

## 17. Criterios de aceite da V1

- DOCX analisado e convertido em conteudo estruturado.
- Perguntas principais implementadas.
- Respostas explicitas com acknowledgement, bloco ou fallback.
- Recomendacao calculada por motor separado da UI.
- Apresentacao pessoal no inicio.
- Posicionamento humilde e profissional.
- "Mais de 200 websites entregues" usado com naturalidade.
- E-commerce, checkout e carrinho ausentes.
- Visual black/verde/roxo com IBM Plex Mono.
- Mobile funcional.
- Persistencia local funcionando.
- Captura de lead validada.
- WhatsApp personalizado funcionando.
- Analytics preparado sem IDs reais.
- SEO basico implementado.
- Acessibilidade minima implementada.
- Documentacao criada.

## 18. Proxima acao

Comecar Fase 1:

1. Criar projeto Vite + TypeScript.
2. Instalar GSAP.
3. Criar estrutura de pastas.
4. Criar arquivos de conteudo a partir do DOCX.
5. Criar motor de regras antes do layout visual.
