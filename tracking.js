/* Eventos da página. Nunca envie nome, respostas ou intenção do quiz aos pixels. */
(function () {
  const META_PIXEL_ID = "1698121791282770";
  const PRODUCT = {
    content_name: "Guia Prático de Bolso — 5 Dias com Aparecida",
    content_type: "product",
    content_ids: ["guia-de-bolso-5-dias-com-aparecida"],
    value: 27.9,
    currency: "BRL"
  };
  const sent = new Set();

  function installMetaPixel() {
    if (!window.fbq) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = "2.0";
      window.fbq = fbq;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      (document.head || document.documentElement).appendChild(script);
    }
    window.fbq("init", META_PIXEL_ID);
    window.fbq("trackSingle", META_PIXEL_ID, "PageView");
  }

  function once(key, send) {
    if (sent.has(key)) return;
    sent.add(key);
    send();
  }

  function trackStandard(name, data) {
    if (typeof window.fbq === "function") window.fbq("trackSingle", META_PIXEL_ID, name, data);
  }

  function trackCustom(name) {
    if (typeof window.fbq === "function") window.fbq("trackSingleCustom", META_PIXEL_ID, name);
  }

  installMetaPixel();

  window.AparecidaTracking = Object.freeze({
    quizStarted() { once("quizStarted", () => trackCustom("QuizStarted")); },
    quizCompleted() { once("quizCompleted", () => trackCustom("QuizCompleted")); },
    salesViewed() { once("salesViewed", () => trackStandard("ViewContent", PRODUCT)); },
    checkoutStarted() { once("checkoutStarted", () => trackStandard("InitiateCheckout", { ...PRODUCT, num_items: 1 })); }
  });
})();
