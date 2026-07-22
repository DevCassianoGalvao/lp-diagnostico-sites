# Eventos de analytics

Eventos tipados em `src/analytics/events.ts`. Nenhum evento envia nome, telefone, e-mail, negócio, cidade ou texto livre.

| Evento | Quando dispara |
| --- | --- |
| `page_view` | Aplicação carregada |
| `start_diagnosis` | Clique para iniciar |
| `intro_view` | Entrada nas perguntas |
| `answer_name` | Nome concluído, sem enviar o nome |
| `answer_business` | Negócio concluído, sem enviar seu texto |
| `answer_niche` | Nicho concluído, com ID normalizado |
| `answer_reach` | Alcance concluído |
| `answer_city` | Cidade concluída, sem enviar seu texto |
| `answer_current_situation` | Momento atual concluído |
| `contact_form_view` | Captura progressiva exibida |
| `contact_captured` | Contato validado e salvo na sessão local |
| `answer_goal` | Objetivo concluído |
| `answer_google_visibility` | Situação no Google concluída |
| `answer_acquisition_channel` | Canal concluído |
| `answer_sales_model` | Modelo de decisão concluído |
| `answer_project_path` | Caminho do projeto concluído |
| `answer_deadline` | Prazo concluído |
| `google_education_view` | Tela educativa exibida |
| `portfolio_preview_view` | Prova relacionada exibida |
| `portfolio_project_preview` | Case aberto no modal interno |
| `diagnosis_complete` | Todas as respostas concluídas |
| `recommendation_view` | Resultado exibido |
| `lead_submit` | Diagnóstico final enviado |
| `lead_notification_sent` | Brevo confirmou o recebimento do diagnóstico completo |
| `offer_gift_reveal` | Presente de hospedagem revelado na oferta |
| `whatsapp_click` | CTA do WhatsApp clicado, com `source` |
| `portfolio_full_view` | Portfólio completo aberto após resultado |
| `restart_diagnosis` | Diagnóstico reiniciado |
| `edit_answer` | Resposta aberta para edição |

`qualified_lead` não é disparado no navegador. Qualificação comercial deve vir de CRM, Conversions API ou integração posterior.

UTMs e `fbclid` ficam na sessão e seguem apenas no payload privado do lead.

## Meta Pixel

A configuração automática está desativada para evitar eventos genéricos de clique. O Pixel recebe somente os sinais abaixo:

| Evento interno | Evento Meta | Tipo |
| --- | --- | --- |
| `start_diagnosis` | `DiagnosisStarted` | Personalizado |
| `contact_captured` | `ContactCaptured` | Personalizado |
| `diagnosis_complete` | `DiagnosisCompleted` | Personalizado |
| `offer_gift_reveal` | `GiftRevealed` | Personalizado |
| `whatsapp_click` | `Contact` | Padrão |
| `lead_notification_sent` | `Lead` | Padrão |

`Lead` só dispara depois que o endpoint confirma a entrega ao Brevo. Nenhum dado pessoal ou texto livre é enviado ao Pixel.
