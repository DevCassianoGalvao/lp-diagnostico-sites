# ANALYTICS_EVENTS.md

Eventos preparados em `src/analytics/events.ts`.

| Evento | Quando dispara | Dados permitidos |
| --- | --- | --- |
| `page_view` | Carregamento da pagina | Nenhum dado pessoal |
| `intro_view` | Visitante avanca da apresentacao pessoal | Nenhum dado pessoal |
| `start_diagnosis` | Clique no CTA inicial | Nenhum dado pessoal |
| `answer_name` | Nome avancado | Sem nome |
| `answer_business` | Negocio avancado | Sem nome do negocio |
| `answer_niche` | Nicho avancado | ID normalizado, se necessario |
| `answer_current_situation` | Situacao avancada | ID normalizado |
| `answer_goal` | Objetivo avancado | ID normalizado |
| `answer_acquisition_channel` | Canal avancado | ID normalizado |
| `recommendation_view` | Resultado exibido | ID da recomendacao |
| `contact_form_view` | Captura aparece | Etapa |
| `lead_submit` | Contato validado | ID da recomendacao |
| `qualified_lead` | Lead qualificado | ID da recomendacao e modulos |
| `whatsapp_click` | Clique no WhatsApp | Contexto do CTA |
| `restart_diagnosis` | Usuario reinicia | Nenhum dado pessoal |
| `edit_answer` | Usuario volta/revisa | Campo alterado |

Regra: nao enviar nome, telefone, e-mail, negocio ou textos livres para analytics.
