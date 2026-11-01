// Theme, RU/EN toggle and scroll effects (reveals, counters, parallax, the pipeline drawing). No trackers.
(function () {
  "use strict";
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } },
  };

  // Theme: the system one until the visitor picks.
  const saved = store.get("theme");
  if (saved) root.dataset.theme = saved;
  document.getElementById("theme").onclick = () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    store.set("theme", root.dataset.theme);
  };

  const EN = {
    skip: "Skip to content", "nav.how": "How it works", "nav.features": "Features", "nav.privacy": "Privacy", "nav.api": "SuperJob API",
    "hero.eyebrow": "Desktop app for Windows",
    "hero.title": 'AI job search — <span class="grad">on your own computer</span>',
    "hero.lead": "Finds vacancies in open sources, scores them honestly against your profile and prepares a tailored CV and cover letter as PDF. You send the application yourself.",
    "hero.soon": "Coming soon · preview", "hero.more": "How it works",
    "stat.sources": "job sources", "stat.batch": "vacancies per local-model request", "stat.sent": "messages to employers without your decision",
    "how.title": "From search to application — one clear path", "how.sub": "Every step is visible and checkable: where a vacancy came from, why it got its score, what went into the CV.",
    "p1.t": "Search", "p1.d": "Public boards, Telegram channels, gsz.gov.by, SuperJob — by your roles and close wordings.",
    "p2.t": "Scoring", "p2.d": "Rules drop scams and deal-breakers, the model adds a score. Every decision comes with a quote.",
    "p3.t": "Documents", "p3.d": "A CV and letter for the vacancy as PDF — only from facts in your profile.",
    "p4.t": "Apply", "p4.d": "You send it yourself. The app only records that you did.",
    "p5.t": "Board", "p5.d": "Application funnel, replies, interviews and “follow up?” reminders.",
    "f.title": "What it does",
    "f1.t": "Your choice of model", "f1.d": "Cloud agents or local models: LM Studio, Ollama, llama.cpp. Hints on answer length and context so the model is not cut off.",
    "f2.t": "Sources", "f2.d": "Public job boards, Telegram channels without an account, gsz.gov.by, Rabota Rossii, SuperJob via its official API. Pauses and caching — gentle on sites.",
    "f3.t": "Honest scoring", "f3.d": "Rules plus a model. “Requirements coverage”: what your facts confirm, what only partly, honest gaps and ATS keywords missing from the profile.",
    "f4.t": "CV and letter as PDF", "f4.d": "Tailored to the vacancy, with no invented experience or clichés. The text layer is checked for ATS.",
    "f5.t": "Board and funnel", "f5.d": "Applications, replies, interviews and offers by source. No reply in N days — a reminder with a draft follow-up.",
    "f6.t": "Swipes in Telegram", "f6.d": "Scheduled search sends the best vacancies one by one: interesting, not interesting, apply — the documents arrive in the chat.",
    "pr.title": "Your data stays with you", "pr.lead": "Profile, vacancies, documents and history live on your computer. API keys are kept in the Windows credential store.",
    "pr.1": "No account with us and no telemetry", "pr.2": "Keys are kept in the Windows credential store (DPAPI), never in files",
    "pr.3": "CAPTCHAs are never bypassed: a human passes every check", "pr.4": "Nothing is ever sent to employers automatically",
    "sj.title": "Use of the SuperJob API",
    "sj.1": "Vacancy search only, through the official SuperJob API (the vacancy list method).",
    "sj.2": "Within the API limits: a pause between requests, a few pages per query at most.",
    "sj.3": "No employer contacts or personal data are collected or passed to third parties.",
    "sj.4": "Every user works with their own application key, stored only on their computer.",
    "sj.5": "Results are shown to the user with a link to the vacancy on superjob.ru.",
    "c.title": "Contact", "c.text": 'Questions and suggestions — via <a href="https://github.com/KSLIL/jobsearch-app-site/issues">GitHub Issues</a>. App builds — on request.',
    foot: "AI Job Search · preview · based on the open-source ai-job-search project (MIT)",
  };
  const RU = {};
  document.querySelectorAll("[data-i18n]").forEach((el) => { RU[el.dataset.i18n] = el.textContent; });
  document.querySelectorAll("[data-i18n-html]").forEach((el) => { RU[el.dataset.i18nHtml] = el.innerHTML; });
  function lang(code) {
    const dict = code === "en" ? EN : RU;
    document.querySelectorAll("[data-i18n]").forEach((el) => { if (dict[el.dataset.i18n]) el.textContent = dict[el.dataset.i18n]; });
    document.querySelectorAll("[data-i18n-html]").forEach((el) => { if (dict[el.dataset.i18nHtml]) el.innerHTML = dict[el.dataset.i18nHtml]; });
    root.lang = code;
    document.getElementById("lang").textContent = code === "en" ? "RU" : "EN";
    store.set("lang", code);
  }
  document.getElementById("lang").onclick = () => lang(root.lang === "en" ? "ru" : "en");
  if (store.get("lang") === "en") lang("en");

  // Stagger siblings that reveal together.
  document.querySelectorAll(".grid, .stats, .checks, .cta").forEach((group) => {
    Array.from(group.children).forEach((el, i) => el.style.setProperty("--d", i * 0.09 + "s"));
  });

  function count(el) {
    const to = +el.dataset.to;
    if (reduce || !to) { el.textContent = String(to); return; }
    const start = performance.now(), dur = 1200;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      el.textContent = String(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const path = document.getElementById("pipe-path");
  if (path) document.getElementById("pipeline").style.setProperty("--len", Math.ceil(path.getTotalLength()));

  if (!("IntersectionObserver" in window) || reduce) {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("in"));
    document.getElementById("pipeline").classList.add("drawn");
    document.querySelectorAll(".count").forEach(count);
  } else {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add(e.target.id === "pipeline" ? "drawn" : "in");
        e.target.querySelectorAll(".count").forEach(count);
        io.unobserve(e.target);
      }
    }, { threshold: 0.18, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal, #pipeline").forEach((el) => io.observe(el));
  }

  // Parallax of the hero graphic (transform only, one rAF per scroll frame).
  const layers = Array.from(document.querySelectorAll("[data-parallax]"));
  if (!reduce && layers.length) {
    let ticking = false;
    const move = () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) layers.forEach((el) => { el.style.transform = `translate3d(0, ${(y * +el.dataset.parallax).toFixed(1)}px, 0)`; });
      ticking = false;
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(move); } }, { passive: true });
  }
})();
