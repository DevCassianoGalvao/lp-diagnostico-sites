import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  Edit3,
  Eye,
  Layers3,
  MessageCircle,
  RefreshCcw,
  ScanSearch,
  Send,
  Sparkles,
  X
} from "lucide-react";
import { gsap } from "gsap";
import { questions, Question, QuestionOption } from "./content/questions";
import { modules } from "./content/recommendations";
import { chapters, getFeedback } from "./content/copy-engine";
import { getResultCopy } from "./content/result-copy";
import { getPortfolioForNiche, portfolioCategories, portfolioProjects, PortfolioProject } from "./content/portfolio";
import { getRecommendation } from "./rules/recommendation-engine";
import { createInitialLead, Lead, LeadKey } from "./state/lead-state";
import { clearSession, loadSession, saveSession, SavedSession } from "./state/persistence";
import { track } from "./analytics/events";
import { buildWhatsappUrl, DIRECT_WHATSAPP_URL, hasConfiguredWhatsapp } from "./services/whatsapp";
import { LeadNotificationPayload, sendLeadNotification } from "./services/lead-notifications";
import { businessName, cleanText, editableText, firstName } from "./utils/sanitize";
import { isValidEmail, isValidWhatsapp } from "./utils/validators";
import "./styles/global.css";

type Screen = "welcome" | "orientation" | "questions" | "portfolio" | "processing" | "result";

declare global {
  interface Window {
    cassianoRoot?: Root;
  }
}

function token(text: string, lead: Lead) {
  const negocio = lead.tipoNegocio === "indefinido" ? "seu projeto" : lead.negocio || "seu negócio";
  return text
    .replaceAll("{nome}", lead.nome || "você")
    .replaceAll("{negocio}", negocio)
    .replaceAll("{negocio_upper}", negocio.toUpperCase());
}

function visibleQuestions(lead: Lead) {
  return questions.filter((question) => !question.visibleWhen || question.visibleWhen(lead as unknown as Record<string, unknown>));
}

function buildLeadNotification(
  phase: LeadNotificationPayload["phase"],
  lead: Lead,
  activeQuestions: Question[],
  result: ReturnType<typeof getRecommendation>
): LeadNotificationPayload {
  const payload: LeadNotificationPayload = {
    phase,
    leadId: lead.leadId,
    contact: {
      name: lead.nome,
      whatsapp: lead.whatsapp,
      email: lead.email,
      consent: lead.consentimento
    }
  };

  if (phase === "completed") {
    const copy = getResultCopy(lead, result);
    payload.answers = activeQuestions
      .map((question) => ({ question: shortQuestion(question), answer: answerFor(question, lead) }))
      .filter((item) => item.answer);
    payload.diagnosis = {
      title: copy.title,
      summary: copy.understood,
      challenge: copy.challenge,
      opportunity: copy.opportunity,
      recommendation: result.recommendation.title,
      recommendationBody: result.recommendation.body,
      modules: result.moduleKeys.map((key) => modules[key].title)
    };
  }

  return payload;
}

function App() {
  const [recovered, setRecovered] = useState<SavedSession | null>(() => loadSession());
  const [lead, setLead] = useState<Lead>(() => {
    const current = recovered?.lead || createInitialLead();
    return current.leadId ? current : { ...current, leadId: createInitialLead().leadId };
  });
  const [step, setStep] = useState(recovered?.step || 0);
  const [screen, setScreen] = useState<Screen>("welcome");
  const [completed, setCompleted] = useState(Boolean(recovered?.completed));
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [notifications, setNotifications] = useState(recovered?.notifications || {});
  const [leadSaving, setLeadSaving] = useState(false);
  const [leadCaptureError, setLeadCaptureError] = useState("");
  const [diagnosisEmailStatus, setDiagnosisEmailStatus] = useState<"idle" | "sending" | "sent" | "error" | "unavailable">(
    recovered?.notifications?.completedAt ? "sent" : "idle"
  );
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
    if (!["questions", "portfolio", "processing", "result"].includes(screen)) return;
    const session: SavedSession = { lead, step: safeStep, completed, notifications, savedAt: new Date().toISOString() };
    if (!saveSession(session)) setAnnouncement("Não foi possível salvar neste dispositivo. Para não perder as respostas, evite fechar a página.");
  }, [lead, safeStep, completed, notifications, screen]);

  function startFresh() {
    clearSession();
    setRecovered(null);
    setLead(createInitialLead());
    setStep(0);
    setCompleted(false);
    setNotifications({});
    setLeadCaptureError("");
    setDiagnosisEmailStatus("idle");
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
    setLead(createInitialLead());
    setStep(0);
    setCompleted(false);
    setNotifications({});
    setLeadCaptureError("");
    setDiagnosisEmailStatus("idle");
    setSummaryOpen(false);
    setAnnouncement("Análise reiniciada.");
    setScreen("welcome");
    track("restart_diagnosis");
  }

  function update<K extends LeadKey>(key: K, value: Lead[K]) {
    setLead((currentLead) => ({ ...currentLead, [key]: value }));
  }

  function applyOption(question: Question, option: QuestionOption) {
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
    if (question.id === "name") {
      return cleanText(lead.nome).length >= 2
        && isValidWhatsapp(lead.whatsapp)
        && Boolean(cleanText(lead.email, 80))
        && isValidEmail(cleanText(lead.email, 80))
        && lead.consentimento;
    }
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

  async function next() {
    if (!current || !canContinue(current)) return;
    if (current.id === "name" && !notifications.startedAt) {
      setLeadSaving(true);
      setLeadCaptureError("");
      try {
        const notification = await sendLeadNotification(buildLeadNotification("started", lead, activeQuestions, result));
        if (notification.delivered) {
          setNotifications((value) => ({ ...value, startedAt: new Date().toISOString() }));
          track("lead_submit", { source: "first_step" });
        }
      } catch {
        setLeadCaptureError("Não consegui registrar seu contato agora. Confira a conexão e tente novamente.");
        setLeadSaving(false);
        return;
      }
      setLeadSaving(false);
    }
    fireAnswerEvent(current);
    if (current.id === "niche") {
      setScreen("portfolio");
      setAnnouncement("Projetos reais relacionados ao seu contexto.");
      return;
    }
    if (safeStep >= activeQuestions.length - 1) {
      setCompleted(true);
      setScreen("processing");
      return;
    }
    setStep((value) => value + 1);
    setAnnouncement(`Etapa ${safeStep + 2} de ${activeQuestions.length}.`);
  }

  function continueFromPortfolio() {
    setStep((value) => value + 1);
    setScreen("questions");
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
    track("edit_answer", { field: current?.id });
  }

  function finishProcessing() {
    setScreen("result");
    track("recommendation_view", { recommendation: result.recommendation.id });
    track("qualified_lead", { recommendation: result.recommendation.id, modules: result.moduleKeys });
    if (!notifications.completedAt) void sendCompletedDiagnosis();
  }

  async function sendCompletedDiagnosis() {
    setDiagnosisEmailStatus("sending");
    try {
      const notification = await sendLeadNotification(buildLeadNotification("completed", lead, activeQuestions, result));
      if (!notification.delivered) {
        setDiagnosisEmailStatus("unavailable");
        return;
      }
      setNotifications((value) => ({ ...value, completedAt: new Date().toISOString() }));
      setDiagnosisEmailStatus("sent");
      setAnnouncement("Seus dados e seu diagnóstico foram enviados com sucesso.");
    } catch {
      setDiagnosisEmailStatus("error");
      setAnnouncement("Não foi possível enviar o diagnóstico por e-mail. Você ainda pode continuar pelo WhatsApp.");
    }
  }

  function editAnswer(questionId: string) {
    const index = activeQuestions.findIndex((question) => question.id === questionId);
    if (index < 0) return;
    setCompleted(false);
    setStep(index);
    setScreen("questions");
    setSummaryOpen(false);
    setAnnouncement("Resposta aberta para edição. A leitura será atualizada com a nova informação.");
    track("edit_answer", { field: questionId });
  }

  const whatsappUrl = buildWhatsappUrl(lead, result);

  return (
    <main className={`app app--${screen}`}>
      <Ambient />
      <Header compact={screen !== "welcome"} />
      <a
        className="floating-whatsapp"
        href={DIRECT_WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("whatsapp_click", { source: "floating_button" })}
      >
        <img src="/assets/icons/whatsapp.svg" alt="" aria-hidden="true" />
        Ir logo para WhatsApp
      </a>
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
          saving={leadSaving}
          captureError={leadCaptureError}
          onText={update}
          onOption={(option) => applyOption(current, option)}
          onNext={next}
          onBack={back}
          onSummary={() => setSummaryOpen(true)}
          summaryButtonRef={summaryButtonRef}
        />
      )}

      {screen === "portfolio" && (
        <PortfolioScreen
          niche={lead.nicho}
          onBack={() => setScreen("questions")}
          onContinue={continueFromPortfolio}
        />
      )}

      {screen === "processing" && <Processing onDone={finishProcessing} />}

      {screen === "result" && (
        <ResultPanel
          lead={lead}
          result={result}
          whatsappUrl={whatsappUrl}
          emailStatus={diagnosisEmailStatus}
          onBack={back}
          onRetryEmail={sendCompletedDiagnosis}
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
      <a className="brand" href="#inicio" aria-label="Cassiano Galvão, página inicial">
        <img src="/assets/brand/logo-cassiano.svg" alt="Cassiano Galvão" />
      </a>
    </header>
  );
}

function Welcome({ recovered, onStart, onResume }: {
  recovered: SavedSession | null;
  onStart: () => void;
  onResume: () => void;
}) {
  const heroCarouselRef = useRef<HTMLDivElement>(null);
  const coverProjectIds = ["congressis", "dr-andre", "wm-suplementos"];
  const coverProjects = coverProjectIds
    .map((id) => portfolioProjects.find((project) => project.id === id))
    .filter((project): project is PortfolioProject => Boolean(project));

  function scrollHeroProjects(direction: -1 | 1) {
    const carousel = heroCarouselRef.current;
    if (!carousel) return;
    carousel.scrollBy({ left: direction * carousel.clientWidth * 0.9, behavior: "smooth" });
  }

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(".welcome__copy > *", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.08, ease: "power2.out" });
    gsap.fromTo(".hero-visual__node", { autoAlpha: 0, scale: 0.76 }, { autoAlpha: 1, scale: 1, duration: 0.55, stagger: 0.12, delay: 0.25, ease: "back.out(1.6)" });

    gsap.fromTo(".hero-project", { autoAlpha: 0, x: 24, rotate: 1.5 }, { autoAlpha: 1, x: 0, rotate: 0, duration: 0.62, stagger: 0.1, delay: 0.2, ease: "power2.out" });
  }, []);

  return (
    <div className="welcome-page">
      <section className="welcome welcome--visitor" id="inicio" aria-labelledby="welcome-title">
        <div className="welcome__copy">
          <p className="eyebrow">DIAGNÓSTICO DIGITAL EM 2 MINUTOS</p>
          <h1 id="welcome-title">O que o seu negócio precisa construir agora?</h1>
          <p className="welcome__lead">
            Responda algumas perguntas e receba uma direção inicial para o seu site, com prioridades pensadas para o seu momento.
          </p>
          <div className="welcome__actions">
            <button className="button button--primary" onClick={onStart}>
              Começar meu diagnóstico <ArrowRight size={19} />
            </button>
            {recovered && (
              <button className="button button--text" onClick={onResume}>
                Continuar de onde parei
              </button>
            )}
          </div>
          <div className="hero-metrics" aria-label="Experiência e duração">
            <span><BriefcaseBusiness size={18} /><strong>+220</strong><small>projetos em 3 anos</small></span>
            <span><Code2 size={18} /><strong>2010</strong><small>início no design</small></span>
            <span><Clock3 size={18} /><strong>2 min</strong><small>para o diagnóstico</small></span>
          </div>
        </div>
        <div className="hero-work" aria-label="Alguns projetos reais desenvolvidos por Cassiano">
          <div className="hero-work__signal"><ScanSearch size={17} /><span>PROJETOS REAIS</span><strong>+220</strong></div>
          <div className="hero-work__controls">
            <button type="button" title="Projeto anterior" aria-label="Ver projeto anterior" onClick={() => scrollHeroProjects(-1)}><ArrowLeft size={18} /></button>
            <button type="button" title="Próximo projeto" aria-label="Ver próximo projeto" onClick={() => scrollHeroProjects(1)}><ArrowRight size={18} /></button>
          </div>
          <div className="hero-work__stack" ref={heroCarouselRef}>
            {coverProjects.map((project, index) => (
              <a className={`hero-project hero-project--${index + 1}`} href={project.url} target="_blank" rel="noreferrer" key={project.id}>
                <img src={project.image} alt={`Projeto ${project.name}`} />
                <span>{project.category}</span>
                <strong>{project.name}</strong>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Orientation({ onBack, onStart }: { onBack: () => void; onStart: () => void }) {
  return (
    <section className="orientation stage" aria-labelledby="orientation-title">
      <p className="eyebrow">ANTES DE COMEÇARMOS</p>
      <h1 id="orientation-title">
        <span>Antes da interface,</span>
        <span>eu preciso entender o negócio.</span>
      </h1>
      <p>
        Eu sou Cassiano Galvão. Trabalho com design desde 2010 e criei esta experiência para compreender cada projeto antes de sugerir qualquer estrutura.
      </p>
      <div className="guide-intro">
        <img src="/assets/photo/cassiano-galvao.jpg" alt="Retrato de Cassiano Galvão" />
        <div>
          <strong>Estratégia antes da interface.</strong>
          <p>Comecei a trabalhar aos 15 anos e participei de centenas de projetos para empresas de segmentos diferentes. Hoje planejo e desenvolvo sites, interfaces e aplicações web.</p>
          <span><BriefcaseBusiness size={16} /> +220 projetos nos últimos 3 anos</span>
        </div>
      </div>
      <div className="duration"><Clock3 size={20} /> Leva aproximadamente 2 minutos.</div>
      <div className="stage-actions">
        <button className="button button--secondary" onClick={onBack}><ArrowLeft size={18} /> Voltar</button>
        <button className="button button--primary" onClick={onStart}>Vamos começar <ArrowRight size={18} /></button>
      </div>
    </section>
  );
}

function QuestionScreen({ question, lead, step, total, progress, canContinue, saving, captureError, onText, onOption, onNext, onBack, onSummary, summaryButtonRef }: {
  question: Question;
  lead: Lead;
  step: number;
  total: number;
  progress: number;
  canContinue: boolean;
  saving: boolean;
  captureError: string;
  onText: <K extends LeadKey>(key: K, value: Lead[K]) => void;
  onOption: (option: QuestionOption) => void;
  onNext: () => void | Promise<void>;
  onBack: () => void;
  onSummary: () => void;
  summaryButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  const selected = question.id === "business" ? lead.tipoNegocio : String(lead[question.field] || "");
  const selectedOption = question.options?.find((option) => option.id === selected);
  const feedback = selectedOption ? getFeedback(question, selectedOption, lead) : null;
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
        <p className="eyebrow">{chapters[question.id]}</p>
        <h1 ref={titleRef} tabIndex={-1} id="question-title">{token(question.title, lead)}</h1>
        {question.help && <p className="question-help">{question.help}</p>}

        {question.type === "text" && question.id !== "name" && (
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

        {question.id === "name" && (
          <div className="lead-capture">
            <label className="field lead-capture__name">
              <span>Seu nome</span>
              <input
                autoFocus
                value={lead.nome}
                autoComplete="given-name"
                placeholder="Digite seu primeiro nome"
                onChange={(event) => onText("nome", firstName(event.target.value))}
              />
            </label>
            <label className="field">
              <span>WhatsApp</span>
              <input
                value={lead.whatsapp}
                inputMode="tel"
                autoComplete="tel"
                placeholder="(22) 99999-9999"
                aria-invalid={Boolean(lead.whatsapp && !isValidWhatsapp(lead.whatsapp))}
                onChange={(event) => onText("whatsapp", editableText(event.target.value, 20))}
              />
              {lead.whatsapp && !isValidWhatsapp(lead.whatsapp) && <small>Inclua o DDD e confira o número.</small>}
            </label>
            <label className="field">
              <span>E-mail</span>
              <input
                value={lead.email}
                inputMode="email"
                autoComplete="email"
                placeholder="voce@empresa.com.br"
                aria-invalid={Boolean(lead.email && !isValidEmail(cleanText(lead.email, 80)))}
                onChange={(event) => onText("email", editableText(event.target.value, 80))}
              />
              {lead.email && !isValidEmail(cleanText(lead.email, 80)) && <small>Confira se o e-mail está completo.</small>}
            </label>
            <label className="consent">
              <input type="checkbox" checked={lead.consentimento} onChange={(event) => onText("consentimento", event.target.checked)} />
              <span>Autorizo o uso destes dados para receber o diagnóstico e conversar sobre meu projeto.</span>
            </label>
          </div>
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
            <span>Nome do negócio</span>
            <input value={lead.negocio} placeholder="Ex.: Clínica Horizonte" onChange={(event) => onText("negocio", businessName(event.target.value))} />
          </label>
        )}

        {selectedOption?.requiresText && (
          <label className="field field--nested">
            <span>Conte um pouco mais</span>
            <textarea
              value={String(lead[selectedOption.requiresText] || "")}
              placeholder="Uma frase já é suficiente."
              onChange={(event) => onText(selectedOption.requiresText!, editableText(event.target.value) as never)}
            />
          </label>
        )}

        {feedback && (
          <div className="microfeedback" aria-live="polite">
            <CheckCircle2 size={19} />
            <div><strong>{feedback.title}</strong><p>{token(feedback.body, lead)}</p></div>
          </div>
        )}

        <div className="stage-actions stage-actions--question">
          <button className="button button--secondary" onClick={onBack}><ArrowLeft size={18} /> Voltar</button>
          <button className="button button--primary" disabled={!canContinue || saving} onClick={onNext}>
            {saving ? "Registrando contato..." : "Continuar"} {!saving && <ArrowRight size={18} />}
          </button>
        </div>
        {captureError && question.id === "name" && <p className="capture-error" role="alert">{captureError}</p>}
      </div>
    </section>
  );
}

function PortfolioScreen({ niche, onBack, onContinue }: {
  niche: string;
  onBack: () => void;
  onContinue: () => void;
}) {
  const [category, setCategory] = useState("Todos");
  const sortedProjects = getPortfolioForNiche(niche);
  const visibleProjects = category === "Todos"
    ? sortedProjects
    : sortedProjects.filter((item) => item.category === category);

  return (
    <section className="portfolio-stage" aria-labelledby="portfolio-stage-title">
      <header className="portfolio-stage__heading">
        <div>
          <p className="eyebrow">ANTES DE CONTINUARMOS</p>
          <h1 id="portfolio-stage-title">
            <span>Projetos reais em</span>
            <span>contextos diferentes.</span>
          </h1>
          <p>Separei primeiro os trabalhos mais próximos da área que você escolheu. Explore outros segmentos ou continue quando quiser.</p>
        </div>
        <div className="portfolio-stage__count"><strong>{portfolioProjects.length}</strong><span>projetos no ar</span></div>
      </header>

      <div className="portfolio-filters" aria-label="Filtrar projetos por categoria">
        {portfolioCategories.map((item) => (
          <button
            type="button"
            className={category === item ? "is-active" : ""}
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
            key={item}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="portfolio-stage__viewport">
        <div className="portfolio-stage__grid">
          {visibleProjects.map((project) => <PortfolioStageCard project={project} key={project.id} />)}
        </div>
      </div>

      <footer className="portfolio-stage__actions">
        <button className="button button--secondary" onClick={onBack}><ArrowLeft size={18} /> Voltar à resposta</button>
        <p>Você pode abrir qualquer projeto em uma nova aba.</p>
        <button className="button button--primary" onClick={onContinue}>Continuar respondendo <ArrowRight size={18} /></button>
      </footer>
    </section>
  );
}

function PortfolioStageCard({ project }: { project: PortfolioProject }) {
  return (
    <a className="portfolio-stage-card" href={project.url} target="_blank" rel="noreferrer">
      <div><img src={project.image} alt={`Página inicial do projeto ${project.name}`} loading="lazy" /></div>
      <footer>
        <span>{project.category}</span>
        <strong>{project.name}</strong>
        <ArrowUpRight size={18} />
      </footer>
    </a>
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
      <p className="eyebrow">JÁ TENHO CONTEXTO SUFICIENTE</p>
      <h1>Organizando uma leitura inicial do seu cenário...</h1>
      <p>Relacionando momento, objetivo, canal e forma de decisão.</p>
    </section>
  );
}

function ResultPanel({ lead, result, whatsappUrl, emailStatus, onBack, onRetryEmail, onSummary, summaryButtonRef }: {
  lead: Lead;
  result: ReturnType<typeof getRecommendation>;
  whatsappUrl: string;
  emailStatus: "idle" | "sending" | "sent" | "error" | "unavailable";
  onBack: () => void;
  onRetryEmail: () => void | Promise<void>;
  onSummary: () => void;
  summaryButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const copy = getResultCopy(lead, result);

  useEffect(() => {
    sectionRef.current?.querySelector<HTMLElement>("h1")?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !sectionRef.current) return;
    gsap.fromTo(sectionRef.current.querySelectorAll("[data-result]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" });
  }, []);

  return (
    <section className="result" ref={sectionRef} aria-labelledby="result-title">
      <header className="result__intro" data-result>
        <p className="eyebrow">SUA RECOMENDAÇÃO INICIAL</p>
        <h1 tabIndex={-1} id="result-title">{copy.title}</h1>
        <p>{copy.limit}</p>
        <button ref={(node) => { summaryButtonRef.current = node; }} className="summary-trigger" onClick={onSummary}><Eye size={17} /> Ver minhas respostas</button>
      </header>

      <section className="result-reading" data-result aria-label="Leitura do cenário">
        <article><p className="section-label">O QUE ENTENDI</p><p>{copy.understood}</p></article>
        <article><p className="section-label">PRINCIPAL DESAFIO</p><p>{copy.challenge}</p></article>
        <article><p className="section-label">OPORTUNIDADE</p><p>{copy.opportunity}</p></article>
      </section>

      <section className="recommendation" data-result aria-labelledby="recommendation-title">
        <Sparkles size={28} />
        <div>
          <p className="section-label">ESTRUTURA SUGERIDA</p>
          <h2 id="recommendation-title">{result.recommendation.title}</h2>
          <strong>{result.recommendation.headline}</strong>
          <p>{result.recommendation.body}</p>
          <h3>Por que pode fazer sentido</h3>
          <p>{copy.why}</p>
          <p className="section-label recommendation__include">O QUE PODERIA FAZER PARTE</p>
          <ul>{result.recommendation.structure.map((item) => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      {result.moduleKeys.length > 0 && (
        <section className="priorities" data-result aria-labelledby="priorities-title">
          <p className="section-label">APOIOS POSSÍVEIS</p>
          <h2 id="priorities-title">O que também pode ajudar</h2>
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

      <section className="result-boundaries" data-result>
        <article><p className="section-label">O QUE NÃO PARECE PRIORIDADE AGORA</p><p>{copy.notPriority}</p></article>
        <article><p className="section-label">EXPERIÊNCIA E LIMITES</p><p>{copy.proof}</p></article>
      </section>

      <section className="next-step" data-result>
        <p className="section-label">PRÓXIMO PASSO</p>
        <h2>{emailStatus === "sent" ? "Já tenho seus dados e seu diagnóstico." : "Seus dados e seu diagnóstico estão prontos."}</h2>
        <p>{emailStatus === "sent"
          ? "Entrarei em contato pelo WhatsApp para pedir algumas informações adicionais e entender melhor o projeto."
          : emailStatus === "sending"
            ? "Estou enviando essas informações. Você também pode iniciar a conversa agora pelo WhatsApp."
            : "Envie tudo pelo WhatsApp. Por lá, vou pedir algumas informações adicionais para entender melhor o projeto."}</p>
        {emailStatus === "sending" && <p className="email-status">Enviando diagnóstico...</p>}
        {emailStatus === "error" && (
          <div className="email-status email-status--error" role="alert">
            <span>O envio por e-mail falhou. Tente novamente ou continue pelo WhatsApp.</span>
            <button type="button" className="button button--secondary" onClick={onRetryEmail}>Tentar novamente</button>
          </div>
        )}
        <div className="final-contact-actions">
          <button type="button" className="button button--secondary" onClick={onBack}><ArrowLeft size={17} /> Revisar</button>
          {hasConfiguredWhatsapp ? (
            <a className="button button--whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", { cta_contexto: result.recommendation.id })}>
              <Send size={18} /> Enviar pelo WhatsApp
            </a>
          ) : (
            <button className="button button--whatsapp" disabled><MessageCircle size={18} /> WhatsApp indisponível</button>
          )}
        </div>
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
        <header><div><p className="section-label">DIAGNÓSTICO</p><h2 id="drawer-title">Minhas respostas</h2></div><button className="icon-button" onClick={onClose} aria-label="Fechar respostas"><X size={21} /></button></header>
        <div className="answer-list">
          {answered.map((question) => (
            <article key={question.id}>
              <div><span>{shortQuestion(question)}</span><strong>{answerFor(question, lead)}</strong></div>
              <button onClick={() => onEdit(question.id)}><Edit3 size={15} /> Editar</button>
            </article>
          ))}
        </div>
        <button className="button button--danger-text" onClick={() => confirmRestart ? onRestart() : setConfirmRestart(true)}>
          <RefreshCcw size={16} /> {confirmRestart ? "Confirmar reinício" : "Recomeçar análise"}
        </button>
      </div>
    </div>
  );
}

function answerFor(question: Question, lead: Lead) {
  if (question.id === "business") {
    if (lead.tipoNegocio === "marca_pessoal") return "Uso meu próprio nome";
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
    name: "Nome", business: "Negócio", niche: "Área de atuação", reach: "Alcance", situation: "Momento atual",
    goal: "Objetivo", channel: "Canal principal", "sales-model": "Modelo de decisão", level: "Estrutura", budget: "Investimento", deadline: "Prazo"
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
  return <><div className="ambient-line" aria-hidden="true" /><div className="ambient-grid" aria-hidden="true" /></>;
}

const rootElement = document.getElementById("root")!;
window.cassianoRoot = window.cassianoRoot || createRoot(rootElement);
window.cassianoRoot.render(<App />);
