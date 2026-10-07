/* Configuração da campanha. O checkout não recebe as respostas do quiz. */
const APARECIDA_OFFER = Object.freeze({ price: "R$ 27,90", checkoutUrl: "https://pay.wiapy.com/q5hfDfxgm7rL", launchesAt: "2026-10-07T00:00:00-03:00", startsAt: "2026-10-08T00:00:00-03:00", endsAt: "2026-10-12T00:00:00-03:00", closesAt: "2026-10-13T00:00:00-03:00" });

/* Apenas parâmetros de campanha seguem para o checkout; respostas do quiz nunca entram no link. */
const APARECIDA_CAMPAIGN_PARAMS = /^(utm_(source|medium|campaign|content|term|id)|fbclid|gclid|ttclid)$/i;

function checkoutDestination(rawUrl) {
  try {
    const destination = new URL(rawUrl);
    if (destination.protocol !== "https:") return null;
    const current = new URLSearchParams(window.location.search);
    let saved = {};
    try { saved = JSON.parse(sessionStorage.getItem("aparecidaCampaignParams") || "{}"); } catch {}
    for (const [key, value] of Object.entries(saved)) {
      if (APARECIDA_CAMPAIGN_PARAMS.test(key) && value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
    }
    for (const [key, value] of current) {
      if (APARECIDA_CAMPAIGN_PARAMS.test(key) && value && !destination.searchParams.has(key)) destination.searchParams.set(key, value);
    }
    return destination.href;
  } catch { return null; }
}

function rememberCampaignParams() {
  const params = {};
  for (const [key, value] of new URLSearchParams(window.location.search)) {
    if (APARECIDA_CAMPAIGN_PARAMS.test(key) && value) params[key] = value;
  }
  if (!Object.keys(params).length) return;
  try { sessionStorage.setItem("aparecidaCampaignParams", JSON.stringify(params)); } catch {}
}

rememberCampaignParams();

(function () {
  const categories = {
    other: { label: "Sua intenção pessoal", message: "Você compartilhou uma intenção que deseja colocar nas mãos de Nossa Senhora Aparecida.", focus: "essa intenção" },
    health: { label: "Saúde", message: "Você nos contou que existe uma intenção relacionada à saúde que deseja colocar nas mãos de Nossa Senhora Aparecida.", focus: "sua intenção pela saúde" },
    motherhood: { label: "Maternidade", message: "Você mencionou uma intenção relacionada à maternidade que ocupa um lugar especial nas suas orações.", focus: "sua intenção relacionada à maternidade" },
    family: { label: "Família", message: "Você compartilhou uma intenção relacionada à sua família que deseja levar a Nossa Senhora Aparecida.", focus: "sua intenção pela família" },
    relationship: { label: "Casamento e relacionamento", message: "Você mencionou uma intenção relacionada ao casamento ou a um relacionamento que deseja levar às suas orações.", focus: "sua intenção pelo relacionamento" },
    relative: { label: "Filho ou familiar", message: "Você compartilhou uma intenção por um filho ou familiar que deseja colocar nas mãos de Nossa Senhora Aparecida.", focus: "sua intenção por alguém da família" },
    freedom: { label: "Álcool ou outra preocupação familiar", message: "Você mencionou uma preocupação envolvendo álcool ou outra dependência. Essa intenção pode ter um espaço nos seus momentos de oração e reflexão.", focus: "a intenção que você compartilhou" },
    work: { label: "Trabalho e carreira", message: "Você compartilhou uma intenção relacionada ao trabalho ou à carreira que deseja levar a Nossa Senhora Aparecida.", focus: "sua intenção pela vida profissional" },
    finance: { label: "Vida financeira", message: "Você nos contou que há uma preocupação financeira que deseja incluir na sua preparação espiritual.", focus: "sua intenção pela vida financeira" },
    home: { label: "Casa ou objetivo material", message: "Você mencionou o desejo de uma casa ou outro objetivo material que deseja incluir nas suas orações.", focus: "o objetivo que você compartilhou" }
  };
  const mounted = new WeakSet();
  const normalize = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const text = (root, selector, value) => { root.querySelectorAll(selector).forEach(node => { node.textContent = value; }); };

  function categoryFor(answers) {
    const explicit = answers.intentionCategory || answers.category;
    if (Object.prototype.hasOwnProperty.call(categories, explicit)) return explicit;
    const normalizedExplicit = normalize(explicit);
    if (normalizedExplicit) {
      const matching = Object.keys(categories).find(key => normalize(categories[key].label) === normalizedExplicit);
      if (matching) return matching;
    }
    let intention = answers.privateIntention === "yes" ? "" : normalize(answers.intention);
    intention = intention.replace(/nao (?:tenho|temos|ha) (?:nenhum |nenhuma )?problema[^.,;!?]*/g, "").replace(/nao (?:e|se trata de) (?:sobre )?(?:saude|maternidade|familia|financas|trabalho)/g, "");
    const patterns = [
      ["motherhood", /engravid|gravidez|maternidade|fertilidade|gestacao|(?:ter|conceber) (?:um |uma )?(?:filho|filha|bebe)/],
      ["freedom", /\b(?:alcool|alcoolismo|drogas?|dependencia|vicio|bebida)\b/],
      ["relationship", /casamento|relacionamento|namoro|conjugal|reconciliacao|marido|esposa|companheir/],
      ["home", /casa propria|(?:comprar|conquistar|conseguir) (?:uma |minha |a )?casa|imovel|apartamento|moradia|objetivo material/],
      ["work", /\b(?:trabalho|emprego|carreira|profissao|desemprego|negocio)\b/],
      ["finance", /financ|divida|\b(?:dinheiro|renda|contas|orcamento)\b/],
      ["health", /saude|doenca|cirurgia|tratamento|cancer|hospital|enfermidade/],
      ["relative", /\b(?:filho|filha|familiar|irmao|irma|neto|neta)\b/],
      ["family", /familia|\b(?:mae|pai|pais)\b/]
    ];
    const match = patterns.find(([, pattern]) => pattern.test(intention));
    if (match) return match[0];
    if (answers.health === "Sim") return "health";
    if (answers.finance === "Sim") return "finance";
    return "other";
  }

  function personalize(root, answers = {}) {
    const name = typeof answers.personName === "string" ? answers.personName.trim().slice(0, 60) : "";
    const key = categoryFor(answers);
    const category = categories[key];
    text(root, "[data-sales-greeting]", name ? `${name}, sua intenção já tem um lugar nesta jornada.` : "Sua intenção já tem um lugar nesta jornada.");
    text(root, "[data-intention-label]", category.label);
    text(root, "[data-personal-message]", category.message);
    text(root, "[data-personal-direction]", `Durante esses cinco dias, ${category.focus} será o centro da sua reflexão, da sua oração e dos pequenos gestos propostos. O guia oferece direção para a preparação; a experiência de cada passo é sua.`);
    text(root, "[data-final-message]", key === "other" ? "Cinco dias para preparar o coração e viver sua intenção com oração, reflexão e ação." : `Leve ${category.focus} para um caminho de cinco passos, com oração, reflexão e ação.`);
    const quote = root.querySelector("[data-intention-quote]");
    if (quote) {
      const intention = typeof answers.intention === "string" ? answers.intention.trim().slice(0, 500) : "";
      quote.hidden = !intention || answers.privateIntention === "yes";
      quote.textContent = quote.hidden ? "" : `Com suas palavras: “${intention}”`;
    }
    const select = root.querySelector("[data-intention-category]");
    if (select) select.value = key;
    return key;
  }

  function campaignState(now = Date.now()) {
    const start = Date.parse(APARECIDA_OFFER.startsAt);
    const end = Date.parse(APARECIDA_OFFER.endsAt);
    const close = Date.parse(APARECIDA_OFFER.closesAt);
    const remaining = Math.max(0, end - now);
    return { phase: now < start ? "before" : now < start + 86400000 ? "first" : now < end ? "during" : now < close ? "day12" : "ended", remaining, days: Math.floor(remaining / 86400000), hours: Math.floor(remaining / 3600000) % 24, minutes: Math.floor(remaining / 60000) % 60, seconds: Math.floor(remaining / 1000) % 60, calendarDays: Math.ceil(remaining / 86400000) };
  }

  function updateCampaign(root, now = Date.now()) {
    const state = campaignState(now);
    const pad = value => String(value).padStart(2, "0");
    text(root, "[data-clock-title]", "A SUA GRAÇA EM:");
    text(root, "[data-clock-invitation]", state.remaining > 0 ? "Faltam poucos dias. Comece hoje a preparar a intenção que você deseja levar consigo." : "A contagem terminou. Você pode retomar sua intenção com oração, reflexão e ação.");
    text(root, "[data-clock-invitation-mobile]", state.remaining > 0 ? "Prepare sua intenção em cinco passos, de 8 a 12 de outubro." : "O dia 12 chegou. Leve sua intenção ao momento de oração.");
    text(root, "[data-clock-cta]", state.remaining > 0 ? "COMEÇAR MEUS 5 DIAS →" : "CONHECER O GUIA →");
    text(root, "[data-clock-middle-intro]", state.remaining > 0 ? "ENQUANTO VOCÊ LÊ, O DIA 12 SE APROXIMA." : "A CONTAGEM ATÉ 12 DE OUTUBRO FOI CONCLUÍDA.");
    text(root, "[data-count-days]", pad(state.days));
    text(root, "[data-count-hours]", pad(state.hours));
    text(root, "[data-count-minutes]", pad(state.minutes));
    text(root, "[data-count-seconds]", pad(state.seconds));
    let badge, title, copy, lead, cta, priceTitle, priceCta, finalCta;
    if (state.phase === "before") {
      badge = "JORNADA DE 8 A 12 DE OUTUBRO";
      title = "Lançamento em 7 de outubro. Primeiro passo no dia 8. Prepare-se hoje.";
      copy = "O dia 12 não vai mudar de data. Para viver os cinco passos de 8 a 12 de outubro, organize agora o seu começo.";
      lead = "Uma preparação de cinco dias para Nossa Senhora Aparecida, de 8 a 12 de outubro. Siga um caminho simples de oração, ação e preparação, com sua intenção no centro — e chegue ao dia 12 sabendo como apresentar aquilo que hoje ocupa seu coração.";
      cta = "Quero começar minha preparação →";
      priceTitle = "Comece sua preparação para o dia 12.";
      priceCta = "Sim, quero começar agora →";
      finalCta = "Começar meus 5 dias agora — R$ 27,90 →";
    } else if (state.phase === "first") {
      badge = "8 DE OUTUBRO · SUA JORNADA COMEÇA HOJE";
      title = "Hoje é o dia do primeiro passo.";
      copy = "A preparação começa em 8 de outubro e culmina no dia 12. Comece hoje para viver os cinco passos do percurso completo.";
      lead = "A jornada de 8 a 12 de outubro começa hoje. Siga um caminho simples de oração, ação e preparação, com sua intenção no centro, até o encontro do dia 12.";
      cta = "Quero começar minha preparação →"; priceTitle = "Comece hoje sua preparação para o dia 12."; priceCta = "Sim, quero começar agora →"; finalCta = "Começar meus 5 dias agora — R$ 27,90 →";
    } else if (state.phase === "during") {
      badge = "JORNADA EM ANDAMENTO · ATÉ 12 DE OUTUBRO";
      title = "O caminho já começou. Ainda há passos para viver.";
      copy = "A jornada começou em 8 de outubro. Ainda há passos para viver até o dia 12: acompanhe os momentos possíveis no seu ritmo, sem cobrança.";
      lead = "A preparação de 8 a 12 de outubro já começou. Use o guia para acompanhar os passos restantes com sua intenção no centro; você também pode retomar a jornada em outro período.";
      cta = "Quero acompanhar a jornada →"; priceTitle = "Viva os passos possíveis até o dia 12."; priceCta = "Quero meu guia de preparação →"; finalCta = "Conhecer meu guia — R$ 27,90 →";
    } else if (state.phase === "day12") {
      badge = "HOJE É 12 DE OUTUBRO · DIA DE NOSSA SENHORA APARECIDA";
      title = "O dia 12 chegou.";
      copy = "A contagem encerrou. Se você está chegando ao guia hoje, pode viver o passo de encerramento e retomar os demais momentos de preparação em outro período.";
      lead = "Hoje é o Dia de Nossa Senhora Aparecida. O guia reúne o percurso de 8 a 12 de outubro e pode acompanhar seu momento de oração de hoje, no Santuário ou de onde estiver.";
      cta = "Quero conhecer o guia →"; priceTitle = "Um guia para guardar e retomar sua intenção."; priceCta = "Quero conhecer o guia →"; finalCta = "Conhecer meu guia — R$ 27,90 →";
    } else {
      badge = "JORNADA DE 8 A 12 DE OUTUBRO DE 2026 · ENCERRADA";
      title = "A data passou. O roteiro pode ser retomado.";
      copy = "A campanha de preparação para 12 de outubro de 2026 terminou. O guia permanece como um roteiro devocional que você pode retomar em outro período.";
      lead = "A jornada de 8 a 12 de outubro de 2026 já terminou. Você pode conhecer o guia e retomar seus passos de oração, reflexão e ação em outro momento, no seu ritmo.";
      cta = "Quero conhecer o guia →"; priceTitle = "Guarde um caminho para retomar sua intenção."; priceCta = "Quero conhecer o guia →"; finalCta = "Conhecer meu guia — R$ 27,90 →";
    }
    text(root, "[data-campaign-badge]", badge); text(root, "[data-urgency-title]", title); text(root, "[data-urgency-copy]", copy); text(root, "[data-hero-lead]", lead); text(root, "[data-price-title]", priceTitle); text(root, "[data-price-cta]", priceCta); text(root, "[data-final-cta]", finalCta);
    root.querySelectorAll("[data-start-label]").forEach(button => { button.textContent = cta; });
    return state;
  }

  function mount(root, answers = {}) {
    personalize(root, answers);
    updateCampaign(root);
    if (mounted.has(root)) return;
    mounted.add(root);
    window.setInterval(() => updateCampaign(root), 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) updateCampaign(root); });
    window.addEventListener("pageshow", () => updateCampaign(root));
    const categorySelect = root.querySelector("[data-intention-category]");
    if (categorySelect) categorySelect.addEventListener("change", () => {
      answers = { ...answers, intentionCategory: categorySelect.value };
      personalize(root, answers);
      if (answers.completed === true) { try { sessionStorage.setItem("rumoAparecidaQuiz", JSON.stringify(answers)); } catch {} }
    });
    const dialog = root.querySelector("[data-checkout-dialog]");
    let checkoutNavigating = false;
    root.querySelectorAll("[data-checkout]").forEach(button => button.addEventListener("click", () => {
      const destination = checkoutDestination(APARECIDA_OFFER.checkoutUrl);
      if (destination) {
        if (checkoutNavigating) return;
        checkoutNavigating = true;
        window.AparecidaTracking?.checkoutStarted();
        window.setTimeout(() => window.location.assign(destination), 150);
        return;
      }
      if (dialog && typeof dialog.showModal === "function") dialog.showModal();
      else window.alert("A compra ainda não está disponível nesta prévia. Nenhum valor foi cobrado.");
    }));
    const close = root.querySelector("[data-close-checkout]");
    if (close && dialog) close.addEventListener("click", () => dialog.close());
  }
  window.AparecidaSales = { mount, personalize, categoryFor, campaignState, updateCampaign };
})();
