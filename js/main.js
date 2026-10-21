/* Serene Mind Hypnotherapy — interactions */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const themeBtn = $("#theme-toggle");
  function setTheme(theme, save) {
    root.setAttribute("data-theme", theme);
    themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
    if (save) {
      try { localStorage.setItem("theme", theme); } catch (e) { /* storage unavailable */ }
    }
  }
  setTheme(root.getAttribute("data-theme") || "light", false);
  themeBtn.addEventListener("click", () => {
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
  });

  /* ---------- Header: shrink on scroll + back-to-top ---------- */
  const header = $(".site-header");
  const backToTop = $("#back-to-top");
  function onScroll() {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    backToTop.classList.toggle("show", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  const navToggle = $("#nav-toggle");
  function closeNav() {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  navToggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$(".main-nav a").forEach((a) => a.addEventListener("click", closeNav));

  /* ---------- Scroll spy: highlight current section in nav ---------- */
  const navLinks = $$(".main-nav a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((a) => {
    const section = $(a.getAttribute("href"));
    if (section) spy.observe(section);
  });

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  // Stagger items that share a parent so cards flow in one after another
  $$(".reveal").forEach((el) => {
    const siblings = $$(":scope > .reveal", el.parentElement);
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 0.1 + "s";
    revealer.observe(el);
  });

  /* ---------- Animated counters ---------- */
  const counter = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      if (reducedMotion) { el.textContent = target; return; }
      const start = performance.now();
      const duration = 1800;
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$(".stat-num").forEach((el) => counter.observe(el));

  /* ---------- Breathing exercise (4s in, 4s hold, 4s out) ---------- */
  const breatheBtn = $("#breathe-btn");
  const circle = $("#breathe-circle");
  const label = $("#breathe-label");
  let breatheTimer = null;
  const phases = [
    { cls: "inhale", text: "Breathe in" },
    { cls: "hold", text: "Hold" },
    { cls: "exhale", text: "Breathe out" }
  ];
  function stopBreathing() {
    clearTimeout(breatheTimer);
    breatheTimer = null;
    circle.className = "breathe-circle";
    label.textContent = "Ready";
    breatheBtn.textContent = "Start breathing";
  }
  breatheBtn.addEventListener("click", () => {
    if (breatheTimer) { stopBreathing(); return; }
    breatheBtn.textContent = "Stop";
    let i = 0;
    (function next() {
      const phase = phases[i % phases.length];
      circle.className = "breathe-circle " + phase.cls;
      label.textContent = phase.text;
      i++;
      breatheTimer = setTimeout(next, 4000);
    })();
  });

  /* ---------- Service modal ---------- */
  const modal = $("#modal");
  const modalBox = $(".modal-box", modal);
  let lastFocus = null;
  function openModal(card) {
    lastFocus = card;
    $("#modal-title").innerHTML = card.dataset.title;
    $("#modal-desc").textContent = card.dataset.desc;
    $("#modal-duration").textContent = card.dataset.duration;
    $("#modal-price").textContent = card.dataset.price;
    $("#modal-book").dataset.serviceTitle = $("#modal-title").textContent;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".modal-close", modal).focus();
  }
  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$(".service-card").forEach((card) => card.addEventListener("click", () => openModal(card)));
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  $("#modal-book").addEventListener("click", (e) => {
    const title = e.currentTarget.dataset.serviceTitle;
    closeModal();
    preselectService(title);
  });
  document.addEventListener("keydown", (e) => {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") {
      // Keep keyboard focus inside the modal
      const focusables = $$("a, button", modalBox);
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------- Pre-fill contact form from service / pricing buttons ---------- */
  const serviceSelect = $("#service");
  function preselectService(title) {
    const match = Array.from(serviceSelect.options).find((o) => o.text === title);
    if (match) serviceSelect.value = match.value;
  }
  $$("[data-package]").forEach((btn) => btn.addEventListener("click", () => {
    $("#package").value = btn.dataset.package;
    const msg = $("#message");
    if (!msg.value) msg.value = "Hi, I'm interested in the " + btn.dataset.package + ".";
  }));

  /* ---------- Testimonials carousel ---------- */
  const track = $("#carousel-track");
  const slides = $$(".slide", track);
  const dotsWrap = $("#carousel-dots");
  let current = 0;
  let autoplay = null;
  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", "Show testimonial " + (i + 1));
    dot.addEventListener("click", () => { goTo(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });
  function goTo(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = "translateX(-" + current * 100 + "%)";
    dots.forEach((d, j) => d.setAttribute("aria-selected", String(j === current)));
    slides.forEach((s, j) => s.setAttribute("aria-hidden", String(j !== current)));
  }
  function start() { if (!reducedMotion) autoplay = setInterval(() => goTo(current + 1), 6000); }
  function stop() { clearInterval(autoplay); }
  function restart() { stop(); start(); }
  $("#carousel-prev").addEventListener("click", () => { goTo(current - 1); restart(); });
  $("#carousel-next").addEventListener("click", () => { goTo(current + 1); restart(); });
  const carousel = $("#carousel");
  carousel.addEventListener("mouseenter", stop);
  carousel.addEventListener("mouseleave", start);
  // Swipe support on touch screens
  let touchX = null;
  carousel.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; stop(); }, { passive: true });
  carousel.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    touchX = null;
    start();
  });
  goTo(0);
  start();

  /* ---------- FAQ accordion ---------- */
  $$(".acc-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isOpen = item.classList.contains("open");
      $$(".acc-item.open").forEach((other) => {
        other.classList.remove("open");
        $(".acc-btn", other).setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- Contact form validation + submit ---------- */
  const form = $("#contact-form");
  const success = $("#form-success");
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  function validateField(input) {
    const field = input.closest(".field");
    let ok = true;
    if (input.required && !input.value.trim()) ok = false;
    if (input.type === "email" && input.value && !emailOk(input.value)) ok = false;
    field.classList.toggle("invalid", !ok);
    return ok;
  }
  const fields = $$("input[required], select[required], textarea[required]", form);
  fields.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("invalid")) validateField(input);
    });
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const allOk = fields.map(validateField).every(Boolean);
    if (!allOk) {
      $(".field.invalid input, .field.invalid select, .field.invalid textarea", form).focus();
      return;
    }
    const submitBtn = $("button[type=submit]", form);
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    try {
      // Only posts once a real Formspree ID has been added to the form's action
      if (!form.action.includes("YOUR_FORM_ID")) {
        const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (!res.ok) throw new Error("Request failed");
      }
      form.reset();
      success.textContent = "Thank you! Your message has been sent — I'll be in touch within 24 hours. 🌿";
      success.hidden = false;
    } catch (err) {
      success.textContent = "Sorry, something went wrong. Please email or call me directly.";
      success.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send message";
    }
  });

  /* ---------- Footer year ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
