const SESSION_KEY = "rumoAparecidaQuiz";

function readAnswers() {
  try {
    const answers = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "{}");
    return answers && typeof answers === "object" && answers.completed === true ? answers : {};
  } catch { return {}; }
}

function setText(root, selector, text) {
  const node = root.querySelector(selector);
  if (node) node.textContent = text;
}

function personalizeOffer(root, answers) {
  if (window.AparecidaSales) window.AparecidaSales.mount(root, answers);
}

function showOffer(answers) {
  const quizView = document.querySelector("#quiz-view");
  const salesView = document.querySelector("#sales-view");
  if (!salesView) return;
  personalizeOffer(salesView, answers);
  quizView.hidden = true;
  salesView.hidden = false;
  window.AparecidaTracking?.salesViewed();
  document.body.classList.remove("quiz-fullscreen");
  document.body.classList.add("sales-page");
  window.location.hash = "sua-jornada";
  window.scrollTo(0, 0);
}

const quizForm = document.querySelector("#quiz-form");
if (quizForm) {
  const steps = [...quizForm.querySelectorAll(".quiz-step")];
  const progressFill = document.querySelector("#progress-fill");
  const stepCount = document.querySelector("#step-count");
  const nextButton = document.querySelector("#next-button");
  const submitButton = document.querySelector("#submit-button");
  const backButton = document.querySelector("#back-button");
  const errorMessage = document.querySelector("#form-error");
  const nameInput = document.querySelector("#person-name");
  const transition = document.querySelector("#quiz-transition");
  const transitionMessage = document.querySelector("#quiz-transition-message");
  let currentStep = 0;
  let revealing = false;

  function updateName() {
    const name = nameInput.value.trim().replace(/\s+/g, " ").slice(0, 60);
    const firstName = name.split(" ")[0];
    document.querySelectorAll("[data-person-name]").forEach(node => { node.textContent = firstName; });
    return name;
  }

  function showStep(index) {
    currentStep = index;
    if (index === 6) updateCommitmentDate();
    updateName();
    steps.forEach((step, position) => { step.hidden = position !== index; });
    progressFill.style.width = `${(index / 6) * 100}%`;
    stepCount.textContent = index === 0 ? "SEU NOME" : `${String(index).padStart(2, "0")} / 06`;
    document.querySelector(".progress-track").setAttribute("aria-valuenow", String(index));
    backButton.hidden = index === 0;
    nextButton.hidden = index === steps.length - 1;
    nextButton.textContent = index === 0 ? "Começar →" : "Continuar →";
    submitButton.hidden = index !== steps.length - 1;
    errorMessage.textContent = "";
    if (index > 0) steps[index].querySelector("legend").focus({ preventScroll: true });
  }

  function updateCommitmentDate() {
    const title = quizForm.querySelector("[data-commitment-title]");
    const state = window.AparecidaSales?.campaignState();
    let introduction = "Faltam poucos dias.";
    if (state) {
      introduction = state.phase === "day12" ? "Hoje é dia 12."
        : state.phase === "ended" ? "Você pode retomar essa intenção."
        : state.calendarDays === 1 ? "Falta apenas 1 dia."
        : "Faltam poucos dias.";
    }
    title.replaceChildren();
    const name = document.createElement("span");
    name.dataset.personName = "";
    title.append(name, `, ${introduction[0].toLowerCase()}${introduction.slice(1)} Você está disposto(a) a dar um pequeno passo por dia por essa intenção?`);
  }

  function validStep() {
    if (currentStep === 0 && !updateName()) {
      errorMessage.textContent = "Digite seu nome para começar.";
      nameInput.focus();
      return false;
    }
    const radioNames = [...new Set([...steps[currentStep].querySelectorAll('input[type="radio"]')].map(input => input.name))];
    if (radioNames.some(name => ![...steps[currentStep].querySelectorAll('input[type="radio"]')].some(input => input.name === name && input.checked))) {
      errorMessage.textContent = "Escolha a resposta que mais se aproxima de você para continuar.";
      return false;
    }
    return true;
  }

  nextButton.addEventListener("click", () => {
    if (!validStep()) return;
    if (currentStep === 0) window.AparecidaTracking?.quizStarted();
    showStep(currentStep + 1);
  });
  backButton.addEventListener("click", () => showStep(Math.max(currentStep - 1, 0)));
  quizForm.addEventListener("input", () => { errorMessage.textContent = ""; });
  quizForm.addEventListener("submit", event => {
    event.preventDefault();
    if (revealing) return;
    if (!validStep()) return;
    if (currentStep < steps.length - 1) { showStep(currentStep + 1); return; }
    window.AparecidaTracking?.quizCompleted();
    const answers = Object.fromEntries(new FormData(quizForm).entries());
    answers.personName = updateName();
    answers.firstName = answers.personName.split(" ")[0];
    answers.intentionCategory = quizForm.querySelector('input[name="intentionChoice"]:checked').dataset.category;
    answers.quizVersion = 2;
    answers.completed = true;
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(answers)); } catch { /* A oferta continua sem persistência. */ }
    revealing = true;
    submitButton.disabled = true;
    document.querySelector("#quiz").hidden = true;
    transition.hidden = false;
    const state = window.AparecidaSales?.campaignState();
    window.setTimeout(() => {
      transitionMessage.textContent = state && ["day12", "ended"].includes(state.phase)
        ? "Com base nas suas respostas, existe uma forma simples de viver sua intenção com oração, reflexão e ação."
        : "Com base nas suas respostas, existe uma forma simples de transformar os próximos dias em uma preparação com propósito.";
    }, 1500);
    window.setTimeout(() => showOffer(answers), 3300);
  });
  showStep(0);
  const existing = readAnswers();
  if (window.location.hash && window.location.hash !== "#quiz" && existing.completed) showOffer(existing);
}

if (!quizForm && document.body.classList.contains("sales-page")) {
  personalizeOffer(document, readAnswers());
  window.AparecidaTracking?.salesViewed();
}

document.querySelectorAll("[data-clear-answers]").forEach(button => {
  button.addEventListener("click", () => {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Nada foi armazenado. */ }
    if (quizForm) quizForm.reset();
    window.location.replace("index.html");
  });
});
