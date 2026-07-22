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
  Gift,
  Layers3,
  MessageCircle,
  RefreshCcw,
  ScanSearch,
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
import { buildCapturedWhatsappUrl, buildWhatsappUrl } from "./services/whatsapp";
import { getCampaignContext, LeadNotificationPayload, sendLeadNotification } from "./services/lead-notifications";
import { businessName, cleanText, editableText, firstName } from "./utils/sanitize";
import { formatWhatsapp, isValidEmail, isValidWhatsapp } from "./utils/validators";
import "./styles/global.css";

type Screen = "welcome" | "orientation" | "questions" | "education" | "portfolio-preview" | "portfolio" | "processing" | "result";

const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`;

function useEnterAdvance(onAdvance: () => void | Promise<void>, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.isComposing || event.repeat) return;
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (target?.closest("textarea, button, a, [role='button'], [role='radio'], input[type='checkbox']")) return;
      event.preventDefault();
      void onAdvance();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onAdvance]);
}

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
      instagram: lead.instagram,
      consent: lead.consentimento
    },
    answers: activeQuestions
      .map((question) => ({ question: shortQuestion(question), answer: answerFor(question, lead) }))
      .filter((item) => item.answer),
    campaign: getCampaignContext(),
    timestamp: new Date().toISOString()
  };

  if (phase === "completed") {
    const copy = getResultCopy(lead, result);
    payload.diagnosis = {
      title: copy.title,
      summary: copy.understood,
      challenge: copy.challenge,
      opportunity: copy.opportunity,
      recommendation: result.recommendation.title,
      recommendationBody: result.recommendation.body,
      modules: result.moduleKeys.map((key) => modules[key].title),
      indicators: Object.values(result.indicators),
      offer: "Site Profissional Essencial por R$ 497, com prazo de criação de 7 dias úteis após o recebimento dos materiais necessários e seis meses de hospedagem grátis. Funcionalidades adicionais podem alterar o valor após a conversa de definição do projeto."
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
    if (screen === "questions" && current?.id === "contact") track("contact_form_view", { step: safeStep + 1 });
  }, [current?.id, safeStep, screen]);

  useEffect(() => {
    if (!["questions", "education", "portfolio-preview", "portfolio", "processing", "result"].includes(screen)) return;
    const session: SavedSession = { lead, step: safeStep, completed, screen, notifications, savedAt: new Date().toISOString() };
    if (!saveSession(session)) setAnnouncement("Não foi possível salvar neste dispositivo. Para não perder as respostas, evite fechar a página.");
  }, [lead, safeStep, completed, notifications, screen]);

  function startFresh() {
    clearSession();
    setRecovered(null);
    setLead(createInitialLead());
    setStep(0);
    setCompleted(false);
    setNotifications({});
    setDiagnosisEmailStatus("idle");
    setScreen("orientation");
    track("start_diagnosis");
  }

  function resume() {
    const resumable: Screen[] = ["questions", "education", "portfolio-preview", "processing", "result"];
    const savedScreen = recovered?.screen as Screen | undefined;
    setScreen(savedScreen && resumable.includes(savedScreen) ? savedScreen : recovered?.completed ? "result" : "questions");
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
      return cleanText(lead.nome).length >= 2;
    }
    if (question.id === "contact") {
      return isValidWhatsapp(lead.whatsapp)
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
    if (current.id === "contact" && !notifications.startedAt) {
      setNotifications((value) => ({ ...value, startedAt: new Date().toISOString() }));
      track("contact_captured", { source: "progressive_capture" });
    }
    fireAnswerEvent(current, lead);
    if (safeStep >= activeQuestions.length - 1) {
      setScreen("education");
      track("google_education_view");
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
    track("edit_answer", { field: current?.id });
  }

  async function finishProcessing() {
    setCompleted(true);
    track("diagnosis_complete", { recommendation: result.recommendation.id });
    track("recommendation_view", { recommendation: result.recommendation.id });
    track("lead_submit", { recommendation: result.recommendation.id });
    if (!notifications.completedAt) await sendCompletedDiagnosis();
    setScreen("result");
  }

  async function sendCompletedDiagnosis() {
    setDiagnosisEmailStatus("sending");
    try {
      const notification = await sendLeadNotification(buildLeadNotification("completed", lead, activeQuestions, result));
      if (!notification.delivered) {
        setDiagnosisEmailStatus("unavailable");
        setAnnouncement("Não foi possível enviar o diagnóstico por e-mail. Tente novamente.");
        return;
      }
      setNotifications((value) => ({ ...value, completedAt: new Date().toISOString() }));
      track("lead_notification_sent", { recommendation: result.recommendation.id });
      setDiagnosisEmailStatus("sent");
      setAnnouncement("Seus dados e seu diagnóstico foram enviados com sucesso.");
    } catch {
      setDiagnosisEmailStatus("error");
      setAnnouncement("Não foi possível enviar o diagnóstico por e-mail. Tente novamente.");
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

  return (
    <main className={`app app--${screen}`}>
      <Ambient />
      <Header compact={screen !== "welcome"} />
      {notifications.startedAt && (
      <a
        className="floating-whatsapp"
        aria-label="Prefere conversar agora pelo WhatsApp?"
        href={screen === "result" ? buildWhatsappUrl(lead, result) : buildCapturedWhatsappUrl(lead)}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("whatsapp_click", { source: "floating_button" })}
      >
        <MessageCircle size={21} aria-hidden="true" />
        <span>Prefere conversar agora?</span>
      </a>
      )}
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

      {screen === "portfolio" && (
        <PortfolioScreen
          onBack={() => setScreen("result")}
        />
      )}

      {screen === "education" && (
        <VisibilityEducation
          lead={lead}
          onBack={() => { setCompleted(false); setScreen("questions"); setStep(Math.max(activeQuestions.length - 1, 0)); }}
          onContinue={() => { setScreen("portfolio-preview"); track("portfolio_preview_view", { niche: lead.nicho }); }}
        />
      )}

      {screen === "portfolio-preview" && (
        <PortfolioPreview
          niche={lead.nicho}
          onBack={() => setScreen("education")}
          onContinue={() => setScreen("processing")}
        />
      )}

      {screen === "processing" && <Processing onDone={finishProcessing} />}

      {screen === "result" && (
        <ResultPanel
          lead={lead}
          result={result}
          emailStatus={diagnosisEmailStatus}
          onRetryEmail={sendCompletedDiagnosis}
          onSummary={() => setSummaryOpen(true)}
          onPortfolio={() => { setScreen("portfolio"); track("portfolio_full_view"); }}
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
        <img src={assetUrl("assets/brand/logo-cassiano.svg")} alt="Cassiano Galvão" />
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
  const welcomeRef = useRef<HTMLElement>(null);
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

    const welcome = welcomeRef.current;
    if (!welcome) return;
    gsap.fromTo(welcome.querySelectorAll(".welcome__copy > *"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.62, stagger: 0.08, ease: "power2.out" });
    gsap.fromTo(welcome.querySelectorAll(".hero-project"), { autoAlpha: 0, x: 24, rotate: 1.5 }, { autoAlpha: 1, x: 0, rotate: 0, duration: 0.62, stagger: 0.1, delay: 0.2, ease: "power2.out" });
  }, []);

  return (
    <div className="welcome-page">
      <section ref={welcomeRef} className="welcome welcome--visitor" id="inicio" aria-labelledby="welcome-title">
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
  useEnterAdvance(onStart);

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
        <img src={assetUrl("assets/photo/cassiano-galvao.jpg")} alt="Retrato de Cassiano Galvão" />
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

function QuestionScreen({ question, lead, step, total, progress, canContinue, onText, onOption, onNext, onBack, onSummary, summaryButtonRef }: {
  question: Question;
  lead: Lead;
  step: number;
  total: number;
  progress: number;
  canContinue: boolean;
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
  useEnterAdvance(onNext, canContinue);

  useEffect(() => {
    titleRef.current?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const content = titleRef.current?.closest(".question-stage__content");
    if (content) gsap.fromTo(content, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.38, ease: "power2.out" });
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
              onChange={(event) => onText(question.field, editableText(event.target.value, 120) as never)}
            />
          </label>
        )}

        {question.id === "name" && (
          <div className="lead-capture lead-capture--name">
            <label className="field">
              <span className="sr-only">Seu primeiro nome</span>
              <input
                autoFocus
                value={lead.nome}
                autoComplete="given-name"
                placeholder="Digite seu primeiro nome"
                onChange={(event) => onText("nome", firstName(event.target.value))}
              />
            </label>
          </div>
        )}

        {question.id === "contact" && (
          <div className="lead-capture lead-capture--contact">
            <label className="field">
              <span>WhatsApp</span>
              <input
                value={lead.whatsapp}
                 inputMode="tel"
                 autoComplete="tel"
                 maxLength={15}
                 placeholder="(22) 99999-9999"
                 aria-invalid={Boolean(lead.whatsapp && !isValidWhatsapp(lead.whatsapp))}
                 onChange={(event) => onText("whatsapp", formatWhatsapp(event.target.value))}
              />
              {lead.whatsapp && !isValidWhatsapp(lead.whatsapp) && <small>Inclua o DDD e confira o número.</small>}
            </label>
            <label className="field">
              <span>E-mail <i>opcional</i></span>
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
            <label className="field lead-capture__instagram">
              <span>Instagram <i>opcional</i></span>
              <input
                value={lead.instagram}
                inputMode="url"
                autoComplete="url"
                placeholder="@empresa ou instagram.com/empresa"
                onChange={(event) => onText("instagram", editableText(event.target.value, 120))}
              />
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
                  if (event.key === " ") {
                    event.preventDefault();
                    onOption(option);
                  }
                  if (event.key === "Enter") {
                    event.preventDefault();
                    if (selected === option.id && canContinue) void onNext();
                    else onOption(option);
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
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && canContinue) {
                  event.preventDefault();
                  void onNext();
                }
              }}
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
          <button className="button button--primary" disabled={!canContinue} onClick={onNext}>
            Continuar <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

function VisibilityEducation({ lead, onBack, onContinue }: { lead: Lead; onBack: () => void; onContinue: () => void }) {
  const business = lead.tipoNegocio === "indefinido" ? "seu projeto" : lead.negocio || "seu negócio";
  useEnterAdvance(onContinue);

  return (
    <section className="education-stage stage" aria-labelledby="education-title">
      <p className="eyebrow">ANTES DA SUA RECOMENDAÇÃO</p>
      <h1 id="education-title">Um site bonito não basta. Ele também precisa ser encontrado e compreendido.</h1>
      <p className="education-stage__lead">Quando alguém procura pelo seu serviço, mecanismos de busca precisam entender quem é sua empresa, o que ela oferece, onde atende e como o cliente pode entrar em contato.</p>
      <div className="education-pillars">
        <article><ScanSearch size={22} /><h2>Conteúdo estratégico</h2><p>Serviços, dúvidas, diferenciais e região de atendimento precisam aparecer em textos claros e relacionados ao que o público procura.</p></article>
        <article><Code2 size={22} /><h2>Estrutura técnica</h2><p>Títulos, descrições, hierarquia, sitemap, velocidade e adaptação para celular ajudam buscadores a acessar e compreender o site.</p></article>
        <article><CheckCircle2 size={22} /><h2>Credibilidade digital</h2><p>Informações consistentes, projetos reais, contato e uma apresentação profissional ajudam o cliente a confiar e decidir.</p></article>
      </div>
      <div className="ai-note"><Sparkles size={20} /><p>Uma estrutura clara também facilita que buscadores e assistentes de inteligência artificial compreendam quem é sua empresa, o que ela oferece e onde atua.</p></div>
      <p className="education-stage__context">Para <strong>{business}</strong>{lead.cidade ? <> em <strong>{lead.cidade}</strong></> : null}, a prioridade é organizar informações que ajudem público e mecanismos de busca a compreenderem o negócio.</p>
      <p className="responsible-note">Essas práticas criam uma base de visibilidade, mas não garantem posição específica em mecanismos de busca ou respostas de inteligência artificial.</p>
      <div className="stage-actions"><button className="button button--secondary" onClick={onBack}><ArrowLeft size={18} /> Voltar</button><button className="button button--primary" onClick={onContinue}>Ver projetos relacionados <ArrowRight size={18} /></button></div>
    </section>
  );
}

function PortfolioPreview({ niche, onBack, onContinue }: { niche: string; onBack: () => void; onContinue: () => void }) {
  useEnterAdvance(onContinue);

  const [selected, setSelected] = useState<PortfolioProject | null>(null);
  const projects = getPortfolioForNiche(niche, 3);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement | null>(null);

  function openProject(project: PortfolioProject, target: HTMLButtonElement) {
    triggerRef.current = target;
    setSelected(project);
    track("portfolio_project_preview", { project_id: project.id });
  }

  useEffect(() => {
    if (!selected) return;
    modalCloseRef.current?.focus();
    document.body.classList.add("has-dialog");
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("keydown", close); document.body.classList.remove("has-dialog"); triggerRef.current?.focus(); };
  }, [selected]);

  return (
    <section className="portfolio-preview stage" aria-labelledby="portfolio-preview-title">
      <p className="eyebrow">PROJETOS DO SEU CONTEXTO</p>
      <h1 id="portfolio-preview-title">Projetos reais em áreas relacionadas.</h1>
      <p>Separei até três trabalhos do nicho escolhido. Nenhum exemplo aleatório entrou nesta seleção.</p>
      <div className="portfolio-preview__grid">
        {projects.map((project) => (
          <button className="portfolio-preview-card" key={project.id} onClick={(event) => openProject(project, event.currentTarget)}>
            <div><img src={project.image} alt={`Página inicial do projeto ${project.name}`} loading="lazy" /></div>
            <footer><span>{project.category}</span><h2>{project.name}</h2><p>{project.summary}</p>{project.solutionType && <strong>{project.solutionType}</strong>}</footer>
          </button>
        ))}
      </div>
      <div className="stage-actions"><button className="button button--secondary" onClick={onBack}><ArrowLeft size={18} /> Voltar</button><button className="button button--primary" onClick={onContinue}>Finalizar meu diagnóstico <ArrowRight size={18} /></button></div>
      {selected && (
        <div className="project-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
            <button ref={modalCloseRef} className="icon-button" onClick={() => setSelected(null)} aria-label="Fechar projeto"><X size={20} /></button>
            <img src={selected.image} alt={`Página inicial do projeto ${selected.name}`} />
            <div><p className="section-label">{selected.solutionType}</p><h2 id="project-modal-title">{selected.name}</h2><p>{selected.summary}</p></div>
          </div>
        </div>
      )}
    </section>
  );
}

function PortfolioScreen({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState("Todos");
  const visibleProjects = category === "Todos" ? portfolioProjects : portfolioProjects.filter((item) => item.category === category);

  return (
    <section className="portfolio-stage" aria-labelledby="portfolio-stage-title">
      <header className="portfolio-stage__heading">
        <div>
          <p className="eyebrow">PORTFÓLIO COMPLETO</p>
          <h1 id="portfolio-stage-title">
            <span>Projetos reais em</span>
            <span>contextos diferentes.</span>
          </h1>
          <p>Explore outros projetos reais depois de concluir seu diagnóstico.</p>
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
        <button className="button button--secondary" onClick={onBack}><ArrowLeft size={18} /> Voltar ao resultado</button>
        <p>Você pode abrir qualquer projeto em uma nova aba.</p>
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
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => onDoneRef.current(), reduced ? 80 : 1250);
    if (!reduced && ref.current) {
      const nodes = ref.current.querySelectorAll("i");
      if (nodes.length) gsap.fromTo(nodes, { scale: 0.72, autoAlpha: 0.2 }, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.2, ease: "power2.out" });
    }
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="processing stage" aria-live="polite">
      <div className="processing__visual" ref={ref} aria-hidden="true"><i /><i /><i /></div>
      <p className="eyebrow">JÁ TENHO CONTEXTO SUFICIENTE</p>
      <h1>Organizando uma leitura inicial do seu cenário...</h1>
      <p>Relacionando momento, objetivo, canal e forma de decisão.</p>
    </section>
  );
}

function ResultPanel({ lead, result, emailStatus, onRetryEmail, onSummary, onPortfolio, summaryButtonRef }: {
  lead: Lead;
  result: ReturnType<typeof getRecommendation>;
  emailStatus: "idle" | "sending" | "sent" | "error" | "unavailable";
  onRetryEmail: () => void | Promise<void>;
  onSummary: () => void;
  onPortfolio: () => void;
  summaryButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const giftRef = useRef<HTMLDivElement>(null);
  const [giftOpen, setGiftOpen] = useState(false);
  const copy = getResultCopy(lead, result);

  useEffect(() => {
    sectionRef.current?.querySelector<HTMLElement>("h1")?.focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !sectionRef.current) return;
    const nodes = sectionRef.current.querySelectorAll("[data-result]");
    if (nodes.length) gsap.fromTo(nodes, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out" });
  }, []);

  useEffect(() => {
    if (!giftOpen || !giftRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(giftRef.current, { autoAlpha: 0, y: 14, scale: 0.98 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "back.out(1.4)" });
  }, [giftOpen]);

  return (
    <section className="result" ref={sectionRef} aria-labelledby="result-title">
      <header className="result__intro" data-result>
        <p className="eyebrow">SUA RECOMENDAÇÃO INICIAL</p>
        <h1 tabIndex={-1} id="result-title">{copy.title}</h1>
        <p>{copy.limit}</p>
        <button ref={(node) => { summaryButtonRef.current = node; }} className="summary-trigger" onClick={onSummary}><Eye size={17} /> Ver minhas respostas</button>
      </header>

      <section className="result-indicators" data-result aria-label="Indicadores do diagnóstico">
        <article><span>Presença digital</span><strong>{result.indicators.presence}</strong></article>
        <article><span>Visibilidade</span><strong>{result.indicators.visibility}</strong></article>
        <article><span>Conversão</span><strong>{result.indicators.conversion}</strong></article>
      </section>

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

      <section className="visibility-result" data-result>
        <ScanSearch size={26} />
        <div><p className="section-label">VISIBILIDADE NO GOOGLE</p><h2>Sua empresa precisa ser encontrada e compreendida</h2><p>{copy.visibility}</p></div>
      </section>

      <section className="offer-block" data-result>
        <div><p className="section-label">UMA FORMA DE COMEÇAR</p><h2>Site Profissional Essencial <span>por R$ 497</span></h2><p>Uma estrutura profissional em uma página completa para apresentar sua empresa, explicar seus serviços, transmitir confiança e facilitar novos contatos.</p></div>
        <ul>
          <li>Planejamento da estrutura</li><li>Criação e organização dos textos</li><li>Layout personalizado</li><li>Desenvolvimento responsivo</li><li>Integração com WhatsApp</li><li>Configurações essenciais de SEO</li><li>Publicação</li><li>Prazo de criação: 7 dias úteis após o envio dos materiais</li>
        </ul>
        {!giftOpen ? (
          <button
            type="button"
            className="offer-gift-trigger"
            aria-expanded="false"
            aria-controls="offer-gift-reveal"
            onClick={() => {
              setGiftOpen(true);
              track("offer_gift_reveal", { offer: "site_497" });
            }}
          >
            <span className="offer-gift-trigger__icon" aria-hidden="true"><Gift size={23} /></span>
            <span><small>Tenho um presente para você</small><strong>Clique aqui e abra agora</strong></span>
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        ) : (
          <div className="offer-gift-reveal" id="offer-gift-reveal" ref={giftRef} role="status">
            <span className="offer-gift-reveal__icon" aria-hidden="true"><Gift size={28} /></span>
            <div>
              <p className="section-label">PRESENTE DESBLOQUEADO</p>
              <h3>6 meses de hospedagem grátis</h3>
              <p>Ao adquirir seu site, você recebe a hospedagem dos primeiros seis meses sem custo.</p>
            </div>
            <strong>Economia de R$ 300</strong>
          </div>
        )}
        <p className="offer-block__note">O valor pode aumentar conforme as funcionalidades que precisarem ser desenvolvidas. O escopo e o valor final serão definidos em uma conversa sobre o projeto.</p>
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
        <h2>Seus dados e seu diagnóstico estão prontos.</h2>
        <p>{emailStatus === "sent"
          ? "Recebi suas informações. Entrarei em contato pelo WhatsApp informado para pedir mais alguns detalhes sobre o projeto."
          : emailStatus === "sending"
            ? "Estou enviando suas informações. Assim que receber o diagnóstico, entrarei em contato pelo WhatsApp informado."
            : "Vou receber essas informações por e-mail e entrar em contato pelo WhatsApp informado."}</p>
        {emailStatus === "sending" && <p className="email-status">Enviando diagnóstico...</p>}
        {emailStatus === "sent" && <p className="email-status">Dados enviados. Agora é comigo.</p>}
        {(emailStatus === "error" || emailStatus === "unavailable") && (
          <div className="email-status email-status--error" role="alert">
            <span>Não consegui concluir o envio da notificação. Tente novamente para garantir que eu receba seus dados.</span>
            <button type="button" className="button button--secondary" onClick={onRetryEmail}>Tentar novamente</button>
          </div>
        )}
        <div className="final-contact-actions">
          <a className="button button--primary" href={buildWhatsappUrl(lead, result)} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", { source: "result_primary" })}><MessageCircle size={19} /> Quero conversar sobre meu site</a>
          <button type="button" className="button button--portfolio" onClick={onPortfolio}>Ver portfólio completo</button>
          <button ref={(node) => { summaryButtonRef.current = node; }} type="button" className="button button--text" onClick={onSummary}><Eye size={17} /> Revisar minhas respostas</button>
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
  if (question.type === "contact") return lead.whatsapp ? "Contato registrado" : "";
  const selected = String(lead[question.field] || "");
  const option = question.options?.find((item) => item.id === selected);
  if (!option) return "";
  const detail = option.requiresText ? String(lead[option.requiresText] || "") : "";
  return detail || option.label;
}

function shortQuestion(question: Question) {
  const labels: Record<string, string> = {
    name: "Nome", business: "Negócio", niche: "Área de atuação", reach: "Alcance", city: "Cidade/região", situation: "Momento atual", contact: "Contato",
    goal: "Objetivo", "google-visibility": "Visibilidade no Google", channel: "Canal principal", "sales-model": "Modelo de decisão", "project-path": "Caminho do projeto", deadline: "Prazo"
  };
  return labels[question.id] || question.title;
}

function fireAnswerEvent(question: Question, lead: Lead) {
  const eventByQuestion: Record<string, Parameters<typeof track>[0]> = {
    name: "answer_name",
    business: "answer_business",
    niche: "answer_niche",
    reach: "answer_reach",
    city: "answer_city",
    situation: "answer_current_situation",
    goal: "answer_goal",
    "google-visibility": "answer_google_visibility",
    channel: "answer_acquisition_channel",
    "sales-model": "answer_sales_model",
    "project-path": "answer_project_path",
    deadline: "answer_deadline"
  };
  const event = eventByQuestion[question.id];
  if (!event) return;
  const safeValue = question.type === "single" && !["business"].includes(question.id)
    ? String(lead[question.field] || "")
    : undefined;
  track(event, safeValue ? { answer_id: safeValue } : {});
}

function Ambient() {
  return <><div className="ambient-line" aria-hidden="true" /><div className="ambient-grid" aria-hidden="true" /></>;
}

const rootElement = document.getElementById("root")!;
window.cassianoRoot = window.cassianoRoot || createRoot(rootElement);
window.cassianoRoot.render(<App />);
