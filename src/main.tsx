import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  Layers3,
  MessageCircle,
  RefreshCcw,
  Send,
  Sparkles,
  X
} from "lucide-react";
import { gsap } from "gsap";
import { questions, Question, QuestionOption } from "./content/questions";
import { modules } from "./content/recommendations";
import { getRecommendation } from "./rules/recommendation-engine";
import { initialLead, Lead, LeadKey } from "./state/lead-state";
import { clearSession, loadSession, saveSession, SavedSession } from "./state/persistence";
import { track } from "./analytics/events";
import { buildWhatsappUrl, hasConfiguredWhatsapp } from "./services/whatsapp";
import { businessName, cleanText, firstName } from "./utils/sanitize";
import { isValidEmail, isValidWhatsapp } from "./utils/validators";
import "./styles/global.css";

type Screen = "welcome" | "orientation" | "questions" | "processing" | "result";

declare global {
  interface Window {
    cassianoRoot?: Root;
  }
}

function token(text: string, lead: Lead) {
  const negocio = lead.tipoNegocio === "indefinido" ? "seu projeto" : lead.negocio || "seu negocio";
  return text
    .replaceAll("{nome}", lead.nome || "voce")
    .replaceAll("{negocio}", negocio)
    .replaceAll("{negocio_upper}", negocio.toUpperCase());
}

function visibleQuestions(lead: Lead) {
  return questions.filter((question) => !question.visibleWhen || question.visibleWhen(lead as unknown as Record<string, unknown>));
}

function App() {
  const [recovered, setRecovered] = useState<SavedSession | null>(() => loadSession());
  const [lead, setLead] = useState<Lead>(recovered?.lead || initialLead);
  const [step, setStep] = useState(recovered?.step || 0);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [completed, setCompleted] = useState(Boolean(recovered?.completed));
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [leadSent, setLeadSent] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const summaryButtonRef = useRef<HTMLButtonElement>(null);

  const activeQuestions = visibleQuestions(lead);
  const safeStep = Math.min(step, Math.max(activeQuestions.length - 1, 0));
  const current = activeQuestions[safeStep];
  const result = useMemo(() => getRecommendation(lead), [lead]);
  const progress = Math.round(((safeStep + 1) / Math.max(activeQuestions.length, 1)) * 100);

  useEffect(() => {
    track("page_view");
  }, []);

  useEffect(() => {
    if (step !== safeStep) setStep(safeStep);
  }, [safeStep, step]);

  useEffect(() => {
    if (!["questions", "processing", "result"].includes(screen)) return;
    const session: SavedSession = { lead, step: safeStep, completed, savedAt: new Date().toISOString() };
    if (!saveSession(session)) setAnnouncement("Nao consegui salvar neste dispositivo. Evite fechar a pagina.");
  }, [lead, safeStep, completed, screen]);

  function startFresh() {
    clearSession();
    setRecovered(null);
    setLead(initialLead);
    setStep(0);
    setCompleted(false);
    setLeadSent(false);
    setErrors({});
    setScreen("orientation");
    track("start_diagnosis");
  }

  function resume() {
    setScreen(recovered?.completed ? "result" : "questions");
    if (recovered?.completed) track("recommendation_view", { recommendation: result.recommendation.id });
  }

  function beginQuestions() {
    setScreen("questions");
    track("intro_view");
  }

  function restart() {
    clearSession();
    setRecovered(null);
    setLead(initialLead);
    setStep(0);
    setCompleted(false);
    setLeadSent(false);
    setSummaryOpen(false);
    setErrors({});
    setAnnouncement("Analise reiniciada.");
    setScreen("welcome");
    track("restart_diagnosis");
  }

  function update<K extends LeadKey>(key: K, value: Lead[K]) {
    setErrors((currentErrors) => ({ ...currentErrors, [key]: "" }));
    setLead((currentLead) => ({ ...currentLead, [key]: value }));
  }

  function applyOption(question: Question, option: QuestionOption) {
    setErrors({});
    setLead((currentLead) => {
      const currentSelection = question.id === "business" ? currentLead.tipoNegocio : String(currentLead[question.field] || "");
      const previous = question.options?.find((item) => item.id === currentSelection);
      const next: Lead = { ...currentLead };

      if (question.id !== "business") next[question.field] = option.id as never;

      if (previous?.requiresText && previous.requiresText !== option.requiresText) {
        (next[previous.requiresText] as string | boolean) = "";
      }

      if (question.id === "business") {
        next.tipoNegocio = option.id as Lead["tipoNegocio"];
        if (option.id === "marca_pessoal") next.negocio = currentLead.nome;
        if (option.id === "indefinido") next.negocio = "";
      }

      if (question.id === "niche") {
        const hasReach = ["saude", "juridico", "consultoria", "servico_local", "imobiliario", "educacao", "comercio"].includes(option.id);
        if (!hasReach) {
          next.alcance = "";
          next.cidade = "";
        }
      }

      return next;
    });
  }

  function canContinue(question: Question | undefined) {
    if (!question || question.optional) return true;
    if (question.type === "text") return cleanText(String(lead[question.field] || "")).length >= 2;
    if (question.type === "single") {
      const selected = question.id === "business" ? lead.tipoNegocio : String(lead[question.field] || "");
      if (!selected) return false;
      const option = question.options?.find((item) => item.id === selected);
      if (question.id === "business" && selected === "empresa") return cleanText(lead.negocio).length >= 2;
      if (option?.requiresText) return cleanText(String(lead[option.requiresText] || "")).length >= 8;
    }
    return true;
  }

  function next() {
    if (!current || !canContinue(current)) return;
    fireAnswerEvent(current);
    if (safeStep >= activeQuestions.length - 1) {
      setCompleted(true);
      setScreen("processing");
      return;
    }
    setStep((value) => value + 1);
    setAnnouncement(`Etapa ${safeStep + 2} de ${activeQuestions.length}.`);
  }

  function back() {
    if (screen === "result") {
      setCompleted(false);
      setScreen("questions");
      setStep(Math.max(activeQuestions.length - 1, 0));
    } else if (safeStep > 0) {
      setStep((value) => Math.max(0, value - 1));
    } else {
      setScreen("orientation");
    }
    setLeadSent(false);
    track("edit_answer", { field: current?.id });
  }

  function finishProcessing() {
    setScreen("result");
    track("recommendation_view", { recommendation: result.recommendation.id });
    track("contact_form_view");
  }

  function editAnswer(questionId: string) {
    const index = activeQuestions.findIndex((question) => question.id === questionId);
    if (index < 0) return;
    setCompleted(false);
    setLeadSent(false);
    setStep(index);
    setScreen("questions");
    setSummaryOpen(false);
    setAnnouncement("Resposta aberta para edicao. As recomendacoes serao recalculadas.");
    track("edit_answer", { field: questionId });
  }

  function submitLead(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!isValidWhatsapp(lead.whatsapp)) nextErrors.whatsapp = "Confira o numero com DDD.";
    if (!isValidEmail(lead.email)) nextErrors.email = "Este e-mail parece incompleto.";
    if (!lead.consentimento) nextErrors.consentimento = "Autorize o envio para continuar.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    track("lead_submit", { recommendation: result.recommendation.id });
    track("qualified_lead", { recommendation: result.recommendation.id, modules: result.moduleKeys });
    setLeadSent(true);
    setAnnouncement("Contato validado. Sua recomendacao esta pronta para a conversa.");
  }

  const whatsappUrl = buildWhatsappUrl(lead, result);

  return (
    <main className={`app app--${screen}`}>
      <Ambient />
      <Header compact={screen !== "welcome"} />
      <p className="sr-only" aria-live="polite">{announcement}</p>

      {screen === "welcome" && (
        <Welcome recovered={recovered} onStart={startFresh} onResume={resume} />
      )}

      {screen === "orientation" && (
        <Orientation onBack={() => setScreen("welcome")} onStart={beginQuestions} />
      )}

      {screen === "questions" && current && (
        <QuestionScreen
          question={current}
          lead={lead}
          step={safeStep}
          total={activeQuestions.length}
          progress={progress}
          canContinue={canContinue(current)}
          onText={update}
          onOption={(option) => applyOption(current, option)}
          onNext={next}
          onBack={back}
          onSummary={() => setSummaryOpen(true)}
          summaryButtonRef={summaryButtonRef}
        />
      )}

      {screen === "processing" && <Processing onDone={finishProcessing} />}

      {screen === "result" && (
        <ResultPanel
          lead={lead}
          result={result}
          errors={errors}
          whatsappUrl={whatsappUrl}
          leadSent={leadSent}
          onBack={back}
          onSubmit={submitLead}
          onUpdate={update}
          onSummary={() => setSummaryOpen(true)}
          summaryButtonRef={summaryButtonRef}
        />
      )}

      <AnswerDrawer
        open={summaryOpen}
        lead={lead}
        questions={activeQuestions}
        onClose={() => setSummaryOpen(false)}
        onEdit={editAnswer}
        onRestart={restart}
        returnFocusRef={summaryButtonRef}
      />
    </main>
  );
}

function Header({ compact }: { compact: boolean }) {
  return (
    <header className={compact ? "header header--compact" : "header"}>
      <a className="brand" href="#inicio" aria-label="Cassiano Galvao, pagina inicial">
        <img src="/assets/brand/logo-cassiano.svg" alt="Cassiano Galvao" />
      </a>
      <span>Cassiano Galvao <i>·</i> Web Designer</span>
    </header>
  );
}

function Welcome({ recovered, onStart, onResume }: {
  recovered: SavedSession | null;
  onStart: () => void;
  onResume: () => void;
}) {
  return (
    <section className="welcome" id="inicio" aria-labelledby="welcome-title">
      <div className="welcome__portrait">
        <img src="/assets/photo/cassiano-galvao.jpg" alt="Retrato de Cassiano Galvao" />
        <span className="portrait-tag">WEB DESIGNER · DESDE 2010</span>
      </div>
      <div className="welcome__copy">
        <p className="eyebrow">UMA CONVERSA SOBRE O SEU PROJETO</p>
        <h1 id="welcome-title">Prazer, eu sou Cassiano.</h1>
        <p className="welcome__lead">
          Trabalho com design desde 2010 e ja participei da criacao de mais de 200 websites.
        </p>
        <p>
          Criei esta experiencia para entender o momento do seu negocio e mostrar qual estrutura digital pode fazer sentido para ele.
        </p>
        <div className="welcome__actions">
          <button className="button button--primary" onClick={onStart}>
            Comecar analise <ArrowRight size={19} />
          </button>
          {recovered && (
            <button className="button button--text" onClick={onResume}>
              Continuar analise salva
            </button>
          )}
        </div>
        <div className="proof" aria-label="Experiencia profissional">
          <strong>+200</strong>
          <span>websites entregues</span>
          <i />
          <strong>2010</strong>
          <span>inicio no design</span>
        </div>
      </div>
    </section>
  );
}

function Orientation({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  return (
    <section className="orientation stage" aria-labelledby="orientation-title">
      <p className="eyebrow">ANTES DE COMECAR</p>
      <h1 id="orientation-title">Vou fazer algumas perguntas rapidas.</h1>
      <p>
        Com base nas suas respostas, vou organizar uma recomendacao inicial para o seu negocio. Voce podera revisar tudo antes de entrar em contato.
      </p>
      <div className="duration"><Clock3 size={20} /> Leva aproximadamente 2 minutos.</div>
      <div className="stage-actions">
        <button className="button button--secondary" onClick={onBack}><ArrowLeft size={18} /> Voltar</button>
        <button className="button button--primary" onClick={onStart}>Vamos comecar <ArrowRight size={18} /></button>
      </div>
    </section>
  );
}

function QuestionScreen({ question, lead, step, total, progress, canContinue, onText, onOption, onNext, onBack, onSummary, summaryButtonRef }: {
  question: Question;
  lead: Lead;
  step: number;
  total: number;
  progress: number;
  canContinue: boolean;
  onText: <K extends LeadKey>(key: K, value: Lead[K]) => void;
  onOption: (option: QuestionOption) => void;
  onNext: () => void;
  onBack: () => void;
  onSummary: () => void;
  summaryButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  const selected = question.id === "business" ? lead.tipoNegocio : String(lead[question.field] || "");
  const selectedOption = question.options?.find((option) => option.id === selected);
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(".question-stage__content", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out" });
  }, [question.id]);

  return (
    <section className="question-stage stage" aria-labelledby="question-title">
      <div className="question-stage__meta">
        <div>
          <span className="step-label">ETAPA {String(step + 1).padStart(2, "0")} DE {String(total).padStart(2, "0")}</span>
          <div className="progress-track" aria-label={`Etapa ${step + 1} de ${total}`}>
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
        {step > 0 && (
          <button ref={(node) => { summaryButtonRef.current = node; }} className="summary-trigger" onClick={onSummary}>
            <Eye size={17} /> Ver respostas
          </button>
        )}
      </div>

      <div className="question-stage__content">
        <h1 ref={titleRef} tabIndex={-1} id="question-title">{token(question.title, lead)}</h1>
        {question.help && <p className="question-help">{question.help}</p>}

        {question.type === "text" && (
          <label className="field">
            <span className="sr-only">{question.title}</span>
            <input
              autoFocus
              value={String(lead[question.field] || "")}
              placeholder={question.placeholder}
              onChange={(event) => onText(question.field, firstName(event.target.value) as never)}
              onKeyDown={(event) => { if (event.key === "Enter" && canContinue) onNext(); }}
            />
          </label>
        )}

        {question.type === "single" && (
          <div className={question.options && question.options.every((option) => option.label.length < 34) ? "options options--compact" : "options"} role="radiogroup" aria-label={token(question.title, lead)}>
            {question.options?.map((option) => (
              <button
                type="button"
                role="radio"
                key={option.id}
                className={selected === option.id ? "option is-selected" : "option"}
                aria-checked={selected === option.id}
                onClick={() => onOption(option)}
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") {
                    event.preventDefault();
                    onOption(option);
                  }
                }}
              >
                <span>{option.label}</span>
                <i aria-hidden="true">{selected === option.id && <Check size={17} strokeWidth={2.4} />}</i>
              </button>
            ))}
          </div>
        )}

        {question.id === "business" && selected === "empresa" && (
          <label className="field field--nested">
            <span>Nome do negocio</span>
            <input value={lead.negocio} placeholder="Ex.: Clinica Horizonte" onChange={(event) => onText("negocio", businessName(event.target.value))} />
          </label>
        )}

        {selectedOption?.requiresText && (
          <label className="field field--nested">
            <span>Conte um pouco mais</span>
            <textarea
              value={String(lead[selectedOption.requiresText] || "")}
              placeholder="Uma frase ja e suficiente."
              onChange={(event) => onText(selectedOption.requiresText!, cleanText(event.target.value, 180) as never)}
            />
          </label>
        )}

        {selectedOption?.ack && (
          <div className="microfeedback" aria-live="polite">
            <CheckCircle2 size={19} />
            <p>{token(selectedOption.ack, lead)}</p>
          </div>
        )}

        <div className="stage-actions stage-actions--question">
          <button className="button button--secondary" onClick={onBack}><ArrowLeft size={18} /> Voltar</button>
          <button className="button button--primary" disabled={!canContinue} onClick={onNext}>
            Continuar <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function Processing({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(onDone, reduced ? 80 : 1250);
    if (!reduced && ref.current) {
      gsap.fromTo(ref.current.querySelectorAll("i"), { scale: 0.72, autoAlpha: 0.2 }, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.2, ease: "power2.out" });
    }
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <section className="processing stage" aria-live="polite">
      <div className="processing__visual" ref={ref} aria-hidden="true"><i /><i /><i /></div>
      <p className="eyebrow">ANALISE CONCLUIDA</p>
      <h1>Organizando sua recomendacao...</h1>
      <p>Relacionando objetivo, momento e caminho de decisao.</p>
    </section>
  );
}

function ResultPanel({ lead, result, errors, whatsappUrl, leadSent, onBack, onSubmit, onUpdate, onSummary, summaryButtonRef }: {
  lead: Lead;
  result: ReturnType<typeof getRecommendation>;
  errors: Record<string, string>;
  whatsappUrl: string;
  leadSent: boolean;
  onBack: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onUpdate: <K extends LeadKey>(key: K, value: Lead[K]) => void;
  onSummary: () => void;
  summaryButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    sectionRef.current?.querySelector<HTMLElement>("h1")?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !sectionRef.current) return;
    gsap.fromTo(sectionRef.current.querySelectorAll("[data-result]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" });
  }, []);

  return (
    <section className="result" ref={sectionRef} aria-labelledby="result-title">
      <header className="result__intro" data-result>
        <p className="eyebrow">RECOMENDACAO INICIAL</p>
        <h1 tabIndex={-1} id="result-title">{token("{nome}, esta e a estrutura que faz mais sentido para {negocio}.", lead)}</h1>
        <p>{result.summary}</p>
        <button ref={(node) => { summaryButtonRef.current = node; }} className="summary-trigger" onClick={onSummary}><Eye size={17} /> Ver minhas respostas</button>
      </header>

      <section className="recommendation" data-result aria-labelledby="recommendation-title">
        <Sparkles size={28} />
        <div>
          <p className="section-label">ESTRUTURA RECOMENDADA</p>
          <h2 id="recommendation-title">{result.recommendation.title}</h2>
          <strong>{result.recommendation.headline}</strong>
          <p>{result.recommendation.body}</p>
          <ul>{result.recommendation.structure.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      {result.moduleKeys.length > 0 && (
        <section className="priorities" data-result aria-labelledby="priorities-title">
          <p className="section-label">PRIORIDADES COMPLEMENTARES</p>
          <h2 id="priorities-title">O que merece entrar no planejamento</h2>
          <div className="priority-list">
            {result.moduleKeys.map((key) => (
              <article key={key}>
                <Layers3 size={20} />
                <div><h3>{modules[key].title}</h3><p>{modules[key].body}</p></div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="next-step" data-result>
        <p className="section-label">PROXIMO PASSO</p>
        <h2>Vamos transformar essa leitura em um projeto real?</h2>
        <p>Deixe um contato para registrar o diagnostico. Depois disso, voce escolhe se quer abrir a conversa no WhatsApp.</p>

        <form className="contact" onSubmit={onSubmit} noValidate>
          <label className="field">
            <span>WhatsApp</span>
            <input
              value={lead.whatsapp}
              inputMode="tel"
              autoComplete="tel"
              placeholder="(22) 99999-9999"
              aria-invalid={Boolean(errors.whatsapp)}
              aria-describedby={errors.whatsapp ? "whatsapp-error" : undefined}
              onChange={(event) => onUpdate("whatsapp", cleanText(event.target.value, 20))}
            />
            {errors.whatsapp && <small id="whatsapp-error" role="alert">{errors.whatsapp}</small>}
          </label>
          <label className="field">
            <span>E-mail <i>opcional</i></span>
            <input
              value={lead.email}
              inputMode="email"
              autoComplete="email"
              placeholder="voce@empresa.com.br"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              onChange={(event) => onUpdate("email", cleanText(event.target.value, 80))}
            />
            {errors.email && <small id="email-error" role="alert">{errors.email}</small>}
          </label>
          <label className="consent">
            <input type="checkbox" checked={lead.consentimento} onChange={(event) => onUpdate("consentimento", event.target.checked)} />
            <span>Concordo em receber este diagnostico e um contato relacionado ao projeto.</span>
          </label>
          {errors.consentimento && <small role="alert">{errors.consentimento}</small>}

          <div className="stage-actions">
            <button type="button" className="button button--secondary" onClick={onBack}><ArrowLeft size={17} /> Revisar</button>
            <button type="submit" className="button button--primary"><Send size={17} /> Salvar contato</button>
          </div>
        </form>

        {leadSent && (
          <div className="contact-success" aria-live="polite">
            <CheckCircle2 size={22} />
            <div><strong>Contato validado.</strong><span>Agora voce pode iniciar a conversa com o resumo preenchido.</span></div>
            {hasConfiguredWhatsapp ? (
              <a className="button button--whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", { cta_contexto: result.recommendation.id })}>
                <MessageCircle size={18} /> {result.recommendation.cta}
              </a>
            ) : (
              <button className="button button--whatsapp" disabled><MessageCircle size={18} /> WhatsApp indisponivel nesta previa</button>
            )}
          </div>
        )}
      </section>
    </section>
  );
}

function AnswerDrawer({ open, lead, questions: activeQuestions, onClose, onEdit, onRestart, returnFocusRef }: {
  open: boolean;
  lead: Lead;
  questions: Question[];
  onClose: () => void;
  onEdit: (questionId: string) => void;
  onRestart: () => void;
  returnFocusRef: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const answered = activeQuestions.filter((question) => answerFor(question, lead));

  useEffect(() => {
    if (!open) return;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>("button, [href], input, textarea, [tabindex]:not([tabindex='-1'])");
    focusable?.[0]?.focus();

    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }

    document.addEventListener("keydown", keydown);
    document.body.classList.add("has-dialog");
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.classList.remove("has-dialog");
      returnFocusRef.current?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  if (!open) return null;
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" ref={drawerRef}>
        <header><div><p className="section-label">DIAGNOSTICO</p><h2 id="drawer-title">Minhas respostas</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar respostas"><X size={21} /></button></header>
        <div className="answer-list">
          {answered.map((question) => (
            <article key={question.id}>
              <div><span>{shortQuestion(question)}</span><strong>{answerFor(question, lead)}</strong></div>
              <button onClick={() => onEdit(question.id)}><Edit3 size={15} /> Editar</button>
            </article>
          ))}
        </div>
        <button className="button button--danger-text" onClick={() => confirmRestart ? onRestart() : setConfirmRestart(true)}>
          <RefreshCcw size={16} /> {confirmRestart ? "Confirmar reinicio" : "Recomecar analise"}
        </button>
      </div>
    </div>
  );
}

function answerFor(question: Question, lead: Lead) {
  if (question.id === "business") {
    if (lead.tipoNegocio === "marca_pessoal") return "Uso meu proprio nome";
    if (lead.tipoNegocio === "indefinido") return "Projeto ainda sem nome";
    return lead.negocio;
  }
  if (question.type === "text") return String(lead[question.field] || "");
  const selected = String(lead[question.field] || "");
  const option = question.options?.find((item) => item.id === selected);
  if (!option) return "";
  const detail = option.requiresText ? String(lead[option.requiresText] || "") : "";
  return detail || option.label;
}

function shortQuestion(question: Question) {
  const labels: Record<string, string> = {
    name: "Nome", business: "Negocio", niche: "Area de atuacao", reach: "Alcance", situation: "Momento atual",
    goal: "Objetivo", channel: "Canal principal", "sales-model": "Modelo de decisao", level: "Estrutura", budget: "Investimento", deadline: "Prazo"
  };
  return labels[question.id] || question.title;
}

function fireAnswerEvent(question: Question) {
  const eventByQuestion: Record<string, Parameters<typeof track>[0]> = {
    name: "answer_name",
    business: "answer_business",
    niche: "answer_niche",
    situation: "answer_current_situation",
    goal: "answer_goal",
    channel: "answer_acquisition_channel"
  };
  const event = eventByQuestion[question.id];
  if (event) track(event);
}

function Ambient() {
  return <><div className="ambient-line" aria-hidden="true" /><div className="ambient-glow" aria-hidden="true" /></>;
}

const rootElement = document.getElementById("root")!;
window.cassianoRoot = window.cassianoRoot || createRoot(rootElement);
window.cassianoRoot.render(<App />);
