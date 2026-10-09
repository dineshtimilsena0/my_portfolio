/* =====================================================================
   Dinesh Timilsena — Portfolio interactions (vanilla JS, no libraries)
   ---------------------------------------------------------------------
   1. Edit CONFIG below with your real links.
   2. Edit PROJECTS for case-study details shown in the modal.
   Everything else works automatically.
   ===================================================================== */

/* ---------- CONFIG — replace the [PLACEHOLDERS] ---------- */
const CONFIG = {
  email: "dineshtimilsena53@gmail.com",
  github: "dineshtimilsena0",        // GitHub username only
  linkedin: "https://www.linkedin.com/in/dineshtimilsena0",
  resume: "public/assets/resume/resu_me.pdf.html",
  introVideo: "public/assets/video/intro.mp4" // MP4 path or YouTube URL
};

/* ---------- Helpers ---------- */
const $ = (s, root = document) => root?.querySelector?.(s);
const $$ = (s, root = document) => [...(root?.querySelectorAll?.(s) || [])];
const isPh = (v) => !v || /^\[.*\]$/.test(String(v).trim());
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const wait = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? 0 : ms));
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

document.documentElement.classList.remove("no-js");

/* ---------- Toast ---------- */
const toastEl = $("#toast");
let toastTimer;
function toast(html) {
  toastEl.innerHTML = html;
  toastEl.classList.add("is-on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-on"), 3600);
}

/* ---------- Link wiring (email / github / linkedin / resume) ---------- */
const LINK_BUILDERS = {
  email: (v) => `mailto:${v}`,
  github: (v) => `https://github.com/${v}`,
  linkedin: (v) => (v.startsWith("http") ? v : `https://www.linkedin.com/in/${v}`),
  resume: (v) => v
};
function wireLinks(root = document) {
  $$("[data-link]", root).forEach((a) => {
    const key = a.dataset.link;
    const val = CONFIG[key];
    const current = typeof a.getAttribute === "function" ? a.getAttribute("href") : a.href;
    // Don't clobber real URLs already written in the HTML (e.g. contact links)
    if (val === undefined || (current && current !== "#")) return;
    if (isPh(val)) {
      a.dataset.placeholder = val || `[${String(key).toUpperCase()}]`;
      a.setAttribute("href", "#");
      return;
    }
    const build = LINK_BUILDERS[key];
    if (!build) return;
    a.href = build(val);
    delete a.dataset.placeholder;
    if (key === "github" || key === "linkedin") { a.target = "_blank"; a.rel = "noopener noreferrer"; }
  });
}
wireLinks();

// Any link still pointing to a placeholder explains itself instead of doing nothing
document.addEventListener("click", (e) => {
  const ph = e.target.closest("[data-placeholder]");
  if (!ph) return;
  e.preventDefault();
  e.stopPropagation();
  toast(`Placeholder link — replace <code>${esc(ph.dataset.placeholder)}</code> in <code>js/script.js</code> or <code>index.html</code>.`);
}, true);

/* ---------- Navigation: glass on scroll, mobile menu, active section ---------- */
const nav = $("#nav");
const navToggle = $("#navToggle");
const navLinks = $("#navLinks");

function setMenu(open) {
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  navLinks.classList.toggle("is-open", open);
}
navToggle.addEventListener("click", () => setMenu(navToggle.getAttribute("aria-expanded") !== "true"));
navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// Map every section to the nav item it belongs to
const NAV_MAP = { home: "home", about: "about", stack: "stack", ai: "stack", pipeline: "stack", projects: "projects", journey: "journey", education: "journey", github: "github", skills: "stack", metrics: "github", video: "contact", contact: "contact" };
const navItems = $$(".nav__link");
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const target = NAV_MAP[entry.target.id];
    navItems.forEach((a) => {
      const on = a.getAttribute("href") === `#${target}`;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach((s) => sectionObserver.observe(s));

/* ---------- Scroll-driven bits (progress bar, nav state, timeline) ---------- */
const progressBar = $(".scroll-progress span");
const timeline = $("#timeline");
let ticking = false;
function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
  nav.classList.toggle("is-scrolled", y > 20);

  const r = timeline.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (window.innerHeight * 0.75 - r.top) / r.height));
  timeline.style.setProperty("--progress", p.toFixed(3));
  ticking = false;
}
window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
onScroll();

/* ---------- Reveal on scroll (with small stagger between siblings) ---------- */
$$(".reveal").forEach((el) => {
  const siblings = [...(el.parentElement?.children || [])].filter((c) => c.classList.contains("reveal"));
  const i = siblings.indexOf(el);
  if (i > 0) el.style.setProperty("--delay", `${Math.min(i, 6) * 70}ms`);
});
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add("is-in");
    revealObserver.unobserve(el);
    // hand transforms back to the element's own hover/tilt transitions
    setTimeout(() => { el.classList.remove("reveal"); el.style.removeProperty("--delay"); }, 1300);
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
$$(".reveal, .mcol").forEach((el) => revealObserver.observe(el));

/* ---------- Technology count (kept in sync with the stack automatically) ---------- */
const techTotal = $$(".tech").length;
$$("[data-tech-count]").forEach((el) => { el.textContent = techTotal; if (el.dataset.count) el.dataset.count = techTotal; });

/* ---------- Animated counters ---------- */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    counterObserver.unobserve(el);
    if (reduceMotion) { el.textContent = target; return; }
    const start = performance.now();
    const dur = 1400;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}, { threshold: 0.6 });
$$("[data-count]").forEach((el) => counterObserver.observe(el));

/* ---------- Skill rings: fill = average depth of the column ---------- */
$$(".mcol").forEach((col) => {
  const levels = $$("[data-level]", col).map((li) => Number(li.dataset.level));
  const avg = levels.reduce((a, b) => a + b, 0) / (levels.length * 3);
  const ring = $(".mcol__ring", col);
  if (ring) ring.style.setProperty("--target", avg.toFixed(2));
});

/* ---------- Pointer effects: tilt, magnetic buttons, cursor glow ---------- */
if (finePointer && !reduceMotion) {
  $$("[data-tilt]").forEach((el) => {
    const max = el.classList.contains("portrait") ? 8 : 5;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - (r.left + r.width / 2);
      const y = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  });

  const glow = $(".cursor-glow");
  window.addEventListener("pointermove", (e) => {
    glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    glow.classList.add("is-on");
  }, { passive: true });
  document.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
}

/* =====================================================================
   TECHNOLOGY CONSTELLATION
   ===================================================================== */
const domains = $$(".domain");
const domainLines = $$(".constellation__lines line");
const coreLabel = $("#coreLabel");
const coreMeta = $("#coreMeta");
let activeFilter = null;

function highlightDomain(key) {
  domains.forEach((d) => {
    d.classList.toggle("is-on", !!key && d.dataset.domain === key);
    d.classList.toggle("is-dim", !!key && d.dataset.domain !== key);
  });
  domainLines.forEach((l) => {
    l.classList.toggle("is-on", !!key && l.dataset.domain === key);
    l.classList.toggle("is-dim", !!key && l.dataset.domain !== key);
  });
  const d = key && domains.find((x) => x.dataset.domain === key);
  if (d) {
    coreLabel.textContent = $(".domain__title", d).textContent.trim();
    coreLabel.style.color = getComputedStyle(d).getPropertyValue("--accent");
    coreMeta.textContent = `${$$(".tech", d).length} technologies`;
  } else {
    coreLabel.textContent = "Full Stack of Data & AI";
    coreLabel.style.color = "";
    coreMeta.textContent = `${techTotal} technologies · ${domains.length} domains`;
  }
}
domains.forEach((d) => {
  const on = () => highlightDomain(d.dataset.domain);
  const off = () => highlightDomain(activeFilter);
  d.addEventListener("mouseenter", on);
  d.addEventListener("mouseleave", off);
  d.addEventListener("focus", on);
  d.addEventListener("blur", off);
});
$$(".stack-filter .chip-btn").forEach((btn) => {
  btn.setAttribute("aria-pressed", btn.classList.contains("is-active"));
  btn.addEventListener("click", () => {
    activeFilter = btn.dataset.filter === "all" ? null : btn.dataset.filter;
    $$(".stack-filter .chip-btn").forEach((b) => { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-pressed", b === btn); });
    highlightDomain(activeFilter);
  });
});

/* =====================================================================
   AI / LLM VISUALIZATION (simulated, deterministic, lightweight)
   ===================================================================== */
const LLM_PRESETS = {
  "what is machine learning?": {
    next: [["Machine", 0.58], ["ML", 0.19], ["It", 0.14], ["A", 0.09]],
    resp: "Machine learning is a branch of AI where systems learn patterns from data to make predictions or decisions — without being explicitly programmed for every rule."
  },
  "how does rag work?": {
    next: [["RAG", 0.51], ["Retrieval", 0.27], ["It", 0.14], ["First", 0.08]],
    resp: "RAG retrieves the most relevant passages from a knowledge base using embeddings, then passes them to the LLM as context — so answers are grounded in real sources."
  },
  "explain a data pipeline": {
    next: [["A", 0.55], ["Data", 0.24], ["In", 0.13], ["Think", 0.08]],
    resp: "A data pipeline moves data from sources through ingestion, cleaning and transformation into storage — so analytics and ML models always work on fresh, trusted data."
  }
};
const STAGE_NAMES = ["Reading question", "Tokenizing", "Embedding tokens", "Mapping vector space", "Running transformer layers", "Predicting next token", "Generating response"];
const TOKEN_COLORS = ["#22d3ee", "#60a5fa", "#a78bfa", "#f472b6", "#2dd4bf", "#818cf8"];

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const embed = (tok, n = 16) => { const r = rng(hash(tok.toLowerCase())); return Array.from({ length: n }, () => +(r() * 2 - 1).toFixed(2)); };

function tokenize(text) {
  const raw = text.match(/[A-Za-z0-9']+|[^\sA-Za-z0-9]/g) || [];
  const out = [];
  raw.forEach((w) => {
    if (w.length > 9) { const cut = Math.ceil(w.length / 2); out.push(w.slice(0, cut), "##" + w.slice(cut)); }
    else out.push(w);
  });
  return out.slice(0, 12);
}

const stages = $$(".stage");
const st = {
  question: $("#stQuestion"), tokens: $("#stTokens"), embed: $("#stEmbed"),
  space: $("#stSpace"), attn: $("#stAttn"), pred: $("#stPred"), resp: $("#stResp")
};
const llmStatus = $("#llmStatus");
const llmProgress = $("#llmProgress");
let llmRun = 0;

function resetLLM() {
  stages.forEach((s) => s.classList.remove("is-active", "is-done"));
  Object.values(st).forEach((el) => { el.innerHTML = '<span class="stage__empty">waiting…</span>'; });
  llmProgress.style.width = "0%";
}

const RENDER = [
  // 1. Question
  (d) => { st.question.innerHTML = `<div class="q-bubble">${esc(d.q)}</div>`; },
  // 2. Tokens
  (d) => {
    st.tokens.innerHTML = `<div class="tokens">${d.tokens.map((t, i) => {
      const c = TOKEN_COLORS[i % TOKEN_COLORS.length];
      return `<span class="token" style="color:${c};border-color:${c}55;background:${c}14;animation-delay:${i * 60}ms">${esc(t)}</span>`;
    }).join("")}</div>`;
  },
  // 3. Embeddings
  (d) => {
    const rows = d.tokens.slice(0, 4).map((t, i) => {
      const bars = embed(t).map((v) => `<i style="height:${Math.max(8, Math.abs(v) * 100)}%;background:${v >= 0 ? "#22d3ee" : "#ec4899"};opacity:${0.35 + Math.abs(v) * 0.65}"></i>`).join("");
      return `<div class="emb__row" style="animation-delay:${i * 90}ms"><span class="emb__tok">${esc(t)}</span><span class="emb__bars">${bars}</span></div>`;
    }).join("");
    const v = embed(d.tokens[0] || "").slice(0, 3);
    st.embed.innerHTML = `<div class="emb">${rows}</div><p class="emb__vec">"${esc(d.tokens[0] || "")}" → [${v.join(", ")}, …]</p>`;
  },
  // 4. Vector space
  (d) => {
    const W = 220, H = 130;
    const bgR = rng(7);
    const bg = Array.from({ length: 26 }, () => `<circle cx="${(bgR() * W).toFixed(1)}" cy="${(bgR() * H).toFixed(1)}" r="1.2" fill="#94a3ff" opacity=".25"/>`).join("");
    const pts = d.tokens.slice(0, 7).map((t) => { const v = embed(t); return { t, x: 20 + ((v[0] + 1) / 2) * (W - 40), y: 14 + ((v[1] + 1) / 2) * (H - 28) }; });
    const cx = pts.reduce((a, p) => a + p.x, 0) / (pts.length || 1);
    const cy = pts.reduce((a, p) => a + p.y, 0) / (pts.length || 1);
    const lines = pts.map((p) => `<line x1="${p.x}" y1="${p.y}" x2="${cx}" y2="${cy}" stroke="#8b5cf6" stroke-opacity=".35" stroke-dasharray="2 2"/>`).join("");
    const dots = pts.map((p, i) => {
      const c = TOKEN_COLORS[i % TOKEN_COLORS.length];
      return `<circle cx="${p.x}" cy="${p.y}" r="3" fill="${c}"/><text x="${p.x + 5}" y="${p.y - 4}">${esc(p.t)}</text>`;
    }).join("");
    st.space.innerHTML = `<div class="space"><svg viewBox="0 0 ${W} ${H}" aria-label="Tokens plotted in a 2D projection of vector space">${bg}${lines}${dots}<circle cx="${cx}" cy="${cy}" r="5" fill="#ec4899" opacity=".9"><animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite"/></circle><text x="${cx + 7}" y="${cy + 10}" fill="#f9a8d4">query</text></svg></div>`;
  },
  // 5. Transformer (self-attention heatmap)
  (d) => {
    const toks = d.tokens.slice(0, 6);
    const n = toks.length || 1;
    const r = rng(hash(d.q));
    let cells = "";
    for (let i = 0; i < n; i++) {
      const row = toks.map((_, j) => r() * 0.6 + (i === j ? 0.5 : 0) + (j < i ? 0.15 : 0));
      const sum = row.reduce((a, b) => a + b, 0);
      row.forEach((w, j) => { cells += `<i style="opacity:${(0.12 + (w / sum) * 2.2).toFixed(2)};animation-delay:${(i * n + j) * 18}ms"></i>`; });
    }
    st.attn.innerHTML = `<div class="attn" style="grid-template-columns:repeat(${n},1fr)">${cells}</div><p class="attn__meta">self-attention · ${n}×${n} · layer 6 / 12</p>`;
  },
  // 6. Prediction
  (d) => {
    st.pred.innerHTML = `<div class="pred">${d.next.map(([t, p]) => `<div class="pred__row"><span class="pred__tok">"${esc(t)}"</span><span class="pred__bar"><span data-w="${p * 100}"></span></span><span class="pred__pct">${Math.round(p * 100)}%</span></div>`).join("")}</div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $$("[data-w]", st.pred).forEach((b) => { b.style.width = `${b.dataset.w}%`; })));
  },
  // 7. Response (typewriter)
  async (d, id) => {
    st.resp.innerHTML = '<p class="resp"><span class="resp__text"></span><span class="resp__cursor" aria-hidden="true"></span></p>';
    const out = $(".resp__text", st.resp);
    if (reduceMotion) { out.textContent = d.resp; return; }
    const words = d.resp.split(" ");
    for (let i = 0; i < words.length; i++) {
      if (id !== llmRun) return;
      out.textContent += (i ? " " : "") + words[i];
      await wait(45);
    }
  }
];

async function runLLM(q) {
  const id = ++llmRun;
  q = q.trim() || "What is machine learning?";
  const preset = LLM_PRESETS[q.toLowerCase()];
  const data = {
    q,
    tokens: tokenize(q),
    next: preset ? preset.next : [["That", 0.41], ["Great", 0.24], ["In", 0.2], ["The", 0.15]],
    resp: preset ? preset.resp : `In a real LLM, the answer to “${q}” would be generated token by token, each one predicted from patterns learned during training. This demo simulates that process.`
  };
  resetLLM();
  for (let i = 0; i < RENDER.length; i++) {
    if (id !== llmRun) return;
    stages.forEach((s, j) => { s.classList.toggle("is-active", j === i); s.classList.toggle("is-done", j < i); });
    llmStatus.textContent = `Stage ${i + 1}/7 · ${STAGE_NAMES[i]}…`;
    llmProgress.style.width = `${((i + 1) / RENDER.length) * 100}%`;
    await RENDER[i](data, id);
    await wait(i === RENDER.length - 1 ? 300 : 850);
  }
  if (id !== llmRun) return;
  stages.forEach((s) => { s.classList.remove("is-active"); s.classList.add("is-done"); });
  llmStatus.textContent = "Done — response generated (simulated)";
}

const llmInput = $("#llmInput");
$("#llmForm").addEventListener("submit", (e) => { e.preventDefault(); runLLM(llmInput.value); });
$$(".llm__presets .chip-btn").forEach((b) => b.addEventListener("click", () => { llmInput.value = b.dataset.q; runLLM(b.dataset.q); }));
resetLLM();
// Auto-run once when the section first becomes visible
new IntersectionObserver((entries, obs) => {
  if (entries[0].isIntersecting) { obs.disconnect(); runLLM(llmInput.value); }
}, { threshold: 0.35 }).observe($(".llm"));

/* =====================================================================
   DATA PIPELINE
   ===================================================================== */
const PIPELINE = [
  { t: "Data Sources", d: "Collect raw data from REST APIs, operational databases, event streams and flat files.", tools: ["REST APIs", "PostgreSQL", "CSV / JSON", "Event streams"] },
  { t: "Ingestion", d: "Extract data on a schedule or in near real time, with retries, logging and incremental loads.", tools: ["Python", "Apache Airflow", "Requests"] },
  { t: "ETL / ELT", d: "Clean, validate, deduplicate and model data into analysis-ready tables.", tools: ["Apache Spark", "Pandas", "SQL"] },
  { t: "Data Lake", d: "Store raw and processed data cheaply in open columnar formats for replay and exploration.", tools: ["Parquet", "Object storage", "Partitioning"] },
  { t: "Data Warehouse", d: "Serve modeled, governed data with star schemas optimized for analytics.", tools: ["PostgreSQL", "Star schema", "Indexes"] },
  { t: "Analytics", d: "Answer business questions with SQL, KPIs and interactive dashboards.", tools: ["SQL", "Power BI", "Plotly"] },
  { t: "Machine Learning", d: "Train, evaluate and serve models on trusted features from the warehouse.", tools: ["Scikit-learn", "XGBoost", "PyTorch", "MLflow"] },
  { t: "Business Insights", d: "Turn predictions and metrics into decisions, alerts and measurable impact.", tools: ["Dashboards", "APIs", "Reports"] }
];
const pipeNodes = $$(".pipe-node");
const pipeStep = $("#pipeStep"), pipeTitle = $("#pipeTitle"), pipeDesc = $("#pipeDesc"), pipeTools = $("#pipeTools");
let pipeIndex = 0, pipeTimer = null, pipeUserControlled = false;

function setPipe(i) {
  pipeIndex = i;
  const s = PIPELINE[i];
  pipeNodes.forEach((n, j) => { n.classList.toggle("is-active", j === i); n.setAttribute("aria-pressed", j === i); });
  pipeStep.textContent = `Stage ${String(i + 1).padStart(2, "0")} / ${String(PIPELINE.length).padStart(2, "0")}`;
  pipeStep.style.color = getComputedStyle(pipeNodes[i]).getPropertyValue("--accent");
  pipeTitle.textContent = s.t;
  pipeDesc.textContent = s.d;
  pipeTools.innerHTML = s.tools.map((t, k) => `<li style="animation-delay:${k * 60}ms">${esc(t)}</li>`).join("");
}
function stopPipeAuto() { clearInterval(pipeTimer); pipeTimer = null; }
function startPipeAuto() {
  if (pipeUserControlled || reduceMotion || pipeTimer) return;
  pipeTimer = setInterval(() => setPipe((pipeIndex + 1) % PIPELINE.length), 3000);
}
pipeNodes.forEach((n, i) => {
  const take = () => { pipeUserControlled = true; stopPipeAuto(); setPipe(i); };
  n.addEventListener("mouseenter", take);
  n.addEventListener("focus", take);
  n.addEventListener("click", take);
});
setPipe(0);
new IntersectionObserver((entries) => {
  entries[0].isIntersecting ? startPipeAuto() : stopPipeAuto();
}, { threshold: 0.3 }).observe($(".pipe"));

/* =====================================================================
   PROJECT MODAL — edit case-study content here
   ===================================================================== */
const PROJECTS = {
  rag: {
    cat: "AI / LLM", title: "RAG Knowledge Assistant", accent: "var(--violet)",
    overview: "A retrieval-augmented generation (RAG) assistant that answers natural-language questions over a private document collection, citing the sources it used.",
    problem: "Important knowledge is spread across PDFs, docs and wikis. Finding a precise answer is slow, and generic chatbots hallucinate.",
    solution: "Documents are chunked and embedded into a vector database. At query time the most relevant chunks are retrieved and passed to an LLM as grounded context.",
    arch: ["Documents", "Chunking", "Embeddings", "Vector DB", "Retriever", "LLM", "Chat UI"],
    tech: ["Python", "LangChain", "Embeddings", "Vector Database", "FastAPI", "LLM API"],
    challenges: ["Choosing chunk size and overlap for retrieval quality", "Reducing hallucinations with source-grounded prompts", "Keeping latency low for interactive use"],
    
  },
  etl: {
    cat: "Data Engineering", title: "End-to-End ETL Pipeline", accent: "var(--cyan)",
    overview: "An orchestrated pipeline that ingests data from multiple sources, transforms it at scale and loads a query-ready warehouse on a schedule.",
    problem: "Raw data arrives from different systems in inconsistent formats, and preparing it manually is slow and error-prone.",
    solution: "Airflow DAGs extract data incrementally, Spark handles cleaning and transformation, and modeled tables are loaded into PostgreSQL with automated quality checks.",
    arch: ["APIs / Files", "Airflow", "Python Extract", "Spark Transform", "Quality Checks", "PostgreSQL", "BI"],
    tech: ["Python", "Apache Airflow", "Apache Spark", "PostgreSQL", "Docker", "SQL"],
    challenges: ["Making tasks idempotent so re-runs are safe", "Handling schema drift from upstream sources", "Incremental loads instead of full refreshes"],
    
  },
  ml: {
    cat: "Machine Learning", title: "Production Prediction System", accent: "var(--blue)",
    overview: "A complete ML workflow — from feature engineering and model selection to a validated REST API that serves predictions.",
    problem: "Teams make decisions on intuition because there is no reliable, accessible predictive signal.",
    solution: "Engineered features, compared models with cross-validation, tracked experiments and served the best model behind a FastAPI endpoint with input validation.",
    arch: ["Raw Data", "Features", "Training", "Evaluation", "Model Registry", "FastAPI", "Client App"],
    tech: ["Python", "Pandas", "Scikit-learn", "XGBoost", "FastAPI", "Docker"],
    challenges: ["Preventing data leakage during feature engineering", "Handling class imbalance", "Matching training and serving preprocessing"],
  
  },
  bi: {
    cat: "Analytics", title: "Business Intelligence Dashboard", accent: "var(--teal)",
    overview: "An interactive dashboard built on a clean dimensional model so stakeholders can explore KPIs on their own.",
    problem: "Stakeholders lack a single, trusted view of key metrics, and every question becomes a manual report.",
    solution: "SQL transformations feed a star-schema data model; reusable measures power an interactive dashboard with filters and drill-downs.",
    arch: ["Sources", "SQL Transforms", "Star Schema", "Measures", "Dashboard", "Stakeholders"],
    tech: ["SQL", "Power BI", "Plotly", "Pandas"],
    challenges: ["Defining metrics consistently across teams", "Keeping dashboards fast on large tables", "Designing for clarity over decoration"],
  
  },
  mlops: {
    cat: "MLOps", title: "Automated ML Deployment", accent: "var(--magenta)",
    overview: "A CI/CD workflow for machine learning: every change is tested, the model is retrained and registered, and a container is deployed automatically.",
    problem: "Manual model releases are slow, hard to reproduce and easy to break.",
    solution: "GitHub Actions runs tests and training, MLflow tracks experiments and versions models, and Docker packages the serving API for deployment.",
    arch: ["Git Push", "CI Pipeline", "Tests", "Train", "MLflow Registry", "Docker Build", "Deploy", "Monitor"],
    tech: ["MLflow", "Docker", "GitHub Actions", "FastAPI", "Python"],
    challenges: ["Reproducible environments across machines", "Promoting models safely between stages", "Monitoring for drift after release"],
  
  },
  platform: {
    cat: "AI Data Platform", title: "Unified AI Data Platform", accent: "var(--cyan)",
    overview: "A capstone system that connects ingestion, processing, machine learning and dashboards into one coherent Data → Intelligence → Impact loop.",
    problem: "Data ingestion, ML experiments and reporting usually live in separate silos, creating duplicated logic and stale insights.",
    solution: "A shared orchestration layer ingests and processes data into a warehouse; models train on the same trusted data and publish predictions to dashboards and an API.",
    arch: ["Sources", "Ingestion", "Data Lake", "Spark", "Warehouse", "ML Model", "API", "Dashboard"],
    tech: ["Apache Airflow", "Apache Spark", "PostgreSQL", "PyTorch", "FastAPI", "Plotly", "Docker"],
    challenges: ["Designing clear boundaries between platform layers", "Sharing features between analytics and ML", "Observability across the whole flow"],
  
  }
};
const ARCH_COLORS = ["#22d3ee", "#38bdf8", "#3b82f6", "#818cf8", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

const modal = $("#projectModal");
const modalContent = $("#modalContent");
let lastFocus = null;

function openProject(key) {
  const p = PROJECTS[key];
  if (!p) return;
  lastFocus = document.activeElement;
  const n = p.arch.length;
  const arch = p.arch.map((a, i) => {
    const c = ARCH_COLORS[Math.round((i * (ARCH_COLORS.length - 1)) / Math.max(1, n - 1))];
    return `${i ? '<span class="arch__arrow" aria-hidden="true"></span>' : ""}<span class="arch__node" style="--c:${c};animation-delay:${i * 70}ms">${esc(a)}</span>`;
  }).join("");

  modalContent.innerHTML = `
    <header class="m-hero" style="--accent:${p.accent}">
      <p class="project__cat">${esc(p.cat)}</p>
      <h2 id="modalTitle">${esc(p.title)}</h2>
      <p class="m-lead">${esc(p.overview)}</p>
    </header>
    <div class="m-body" style="--accent:${p.accent}">
      <div class="m-grid">
        <div class="m-block"><h3>Problem</h3><p>${esc(p.problem)}</p></div>
        <div class="m-block"><h3>Solution</h3><p>${esc(p.solution)}</p></div>
      </div>
      <div>
        <p class="m-label">Architecture</p>
        <div class="arch" role="list" aria-label="Architecture: ${esc(p.arch.join(" to "))}">${arch}</div>
      </div>
      <div class="m-grid">
        <div class="m-block"><h3>Technologies</h3><ul class="project__stack">${p.tech.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>
        <div class="m-block"><h3>Challenges</h3><ul class="m-list">${p.challenges.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
      </div>
      <div class="m-block"><h3>Results</h3><p><span class="ph">${esc(p.results)}</span></p></div>
      <div class="m-actions">
        <a href="#" class="btn btn--primary btn--sm" data-link="github"><svg class="i"><use href="#i-github"/></svg>View on GitHub</a>
        <a href="#" class="btn btn--ghost btn--sm" data-placeholder="[LIVE DEMO URL]"><svg class="i"><use href="#i-external"/></svg>Live Demo</a>
      </div>
    </div>`;
  wireLinks(modalContent);
  modal.showModal();
  document.documentElement.style.overflow = "hidden";
  $("#modalClose").focus();
}
function closeProject() { modal.close(); }
modal.addEventListener("close", () => {
  document.documentElement.style.overflow = "";
  if (lastFocus) lastFocus.focus();
});
$("#modalClose").addEventListener("click", closeProject);
modal.addEventListener("click", (e) => { if (e.target === modal) closeProject(); });

$$(".project").forEach((card) => {
  card.addEventListener("click", (e) => {
    const opener = e.target.closest("[data-open]");
    if (opener) { openProject(opener.dataset.open); return; }
    if (e.target.closest("a, button")) return; // other buttons keep their own behaviour
    openProject(card.dataset.project);
  });
});

/* =====================================================================
   GITHUB — real data from the public GitHub API when a username is set
   ===================================================================== */
const contrib = $("#contrib");
if (contrib) {
  contrib.innerHTML = Array.from({ length: 53 * 7 }, (_, i) => `<i style="--d:${Math.floor(i / 7)}"></i>`).join("");
  contrib.classList.add("is-empty");
}

const LANG_COLORS = { Python: "#3b82f6", "Jupyter Notebook": "#f97316", SQL: "#22d3ee", JavaScript: "#eab308", TypeScript: "#60a5fa", HTML: "#f472b6", CSS: "#a78bfa", Shell: "#34d399", R: "#2dd4bf", Scala: "#ec4899" };

async function loadGitHub(user) {
  const note = $("#ghGraphNote");
  try {
    const [uRes, rRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(user)}`),
      fetch(`https://api.github.com/users/${encodeURIComponent(user)}/repos?per_page=100&sort=updated`)
    ]);
    if (!uRes.ok || !rRes.ok) throw new Error("GitHub API error");
    const u = await uRes.json();
    const repos = (await rRes.json()).filter((r) => !r.fork);

    $("#ghAvatar").innerHTML = `<img src="${esc(u.avatar_url)}" alt="GitHub avatar of ${esc(u.name || user)}" loading="lazy" width="96" height="96">`;
    $("#ghName").textContent = u.name || user;
    $("#ghHandle").textContent = `@${u.login}`;
    if (u.bio) $("#ghBio").textContent = u.bio;
    $("#ghRepos").textContent = u.public_repos;
    $("#ghFollowers").textContent = u.followers;
    $("#ghFollowing").textContent = u.following;

    // Languages — share of repositories by primary language
    const counts = {};
    repos.forEach((r) => { if (r.language) counts[r.language] = (counts[r.language] || 0) + 1; });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (total) {
      $("#langBar").innerHTML = top.map(([l, c]) => `<span style="--w:${(c / total) * 100}%;--c:${LANG_COLORS[l] || "#94a3b8"}"></span>`).join("");
      $("#langList").innerHTML = top.map(([l, c]) => `<li style="--c:${LANG_COLORS[l] || "#94a3b8"}">${esc(l)} <b>${Math.round((c / total) * 100)}%</b></li>`).join("");
      $("#ghLangNote").textContent = `${total} repos`;
    }

    // Repositories — most starred, then most recent
    const best = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count || new Date(b.pushed_at) - new Date(a.pushed_at)).slice(0, 4);
    if (best.length) {
      $("#repoList").innerHTML = best.map((r) => `
        <li class="repo glass"><svg class="i"><use href="#i-folder"/></svg><div>
          <h4><a href="${esc(r.html_url)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a></h4>
          <p>${esc(r.description || "No description yet.")}</p>
          <span class="repo__lang" style="--c:${LANG_COLORS[r.language] || "#94a3b8"}">${esc(r.language || "—")} · ★ ${r.stargazers_count}</span>
        </div></li>`).join("");
    }

    // Contribution graph via public chart service
    const img = new Image();
    img.alt = `GitHub contribution graph for ${user}`;
    img.loading = "lazy";
    img.onload = () => { contrib.classList.remove("is-empty"); contrib.style.display = "block"; contrib.innerHTML = ""; contrib.appendChild(img); note.textContent = "last 12 months"; };
    img.onerror = () => { note.textContent = "graph unavailable"; };
    img.src = `https://ghchart.rshah.org/8b5cf6/${encodeURIComponent(user)}`;
  } catch {
    note.textContent = "Could not load GitHub data";
  }
}
if (!isPh(CONFIG.github)) loadGitHub(CONFIG.github);
else if (contrib) $("#ghGraphNote").textContent = "Set your GitHub username to load activity";

/* =====================================================================
   INTRO VIDEO
   ===================================================================== */
$("#videoPlay").addEventListener("click", () => {
  const url = CONFIG.introVideo;
  if (isPh(url)) {
    toast("Add your introduction video URL to <code>CONFIG.introVideo</code> in <code>js/script.js</code>.");
    return;
  }
  const frame = $("#videoFrame");
  // Hide poster, shade, meta and play button — don't wipe innerHTML since this button is inside frame
  $$(".video__poster, .video__shade, .video__meta, .video__play, .video__play-ring", frame).forEach(el => el.style.display = "none");
  const yt = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  if (yt) {
    frame.insertAdjacentHTML("beforeend", `<iframe src="https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1&rel=0" title="Introduction video" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`);
  } else {
    const vid = document.createElement("video");
    vid.src = url;
    vid.controls = true;
    vid.autoplay = true;
    vid.playsInline = true;
    vid.muted = true; // muted required for autoplay in most browsers
    frame.appendChild(vid);
    // Unmute after autoplay starts
    vid.addEventListener("playing", () => { vid.muted = false; }, { once: true });
  }
});

/* =====================================================================
   CONTACT FORM — frontend validation only (no backend)
   ===================================================================== */
const form = $("#contactForm");
const RULES = {
  name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Please enter a valid email address."),
  message: (v) => (v.trim().length >= 10 ? "" : "Message should be at least 10 characters.")
};
function validateField(input) {
  const msg = RULES[input.name](input.value);
  const field = input.closest(".field");
  field.classList.toggle("has-error", !!msg);
  $(".field__err", field).textContent = msg;
  input.setAttribute("aria-invalid", String(!!msg));
  return !msg;
}
$$("input, textarea", form).forEach((el) => {
  el.addEventListener("blur", () => { if (el.value) validateField(el); });
  el.addEventListener("input", () => { if (el.closest(".field").classList.contains("has-error")) validateField(el); });
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fields = $$("input, textarea", form);
  const ok = fields.map(validateField).every(Boolean);
  const okEl = $("#formOk");
  if (!ok) { okEl.textContent = ""; fields.find((f) => f.getAttribute("aria-invalid") === "true")?.focus(); return; }
  const data = Object.fromEntries(new FormData(form));
  if (!isPh(CONFIG.email)) {
    const body = encodeURIComponent(`${data.message}\n\n— ${data.name} (${data.email})`);
    window.location.href = `mailto:${CONFIG.email}?subject=${encodeURIComponent(`Portfolio contact from ${data.name}`)}&body=${body}`;
    okEl.textContent = `Thanks, ${data.name}! Your email app should open with the message ready.`;
  } else {
    okEl.textContent = `Thanks, ${data.name}! Your message looks good. (Demo mode: set CONFIG.email or connect a form service to deliver it.)`;
  }
  form.reset();
});
