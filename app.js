const projects = [
  {
    slug: "dockflow-intelligence",
    name: "Dockflow Intelligence",
    repo: "enterprise-intelligent-document-automation-platform-python",
    category: "AI & document automation",
    short: "OCR, field checks & a human review queue",
    brief: "A logistics document workbench for bills of lading, commercial invoices, packing lists, proofs of delivery, and customs forms. It extracts key fields and routes uncertain records to a person for review.",
    outcome: "A FastAPI dashboard that extracts embedded PDF text, runs OCR on scanned files, classifies documents, checks required fields, and lets a reviewer search records or export a CSV. Demo records are synthetic.",
    use: "A back-office logistics team could use this kind of workflow to triage incoming paperwork, catch missing fields, and focus manual review on the documents that need it.",
    note: "Uploaded files and full OCR text are processed in memory; extracted metadata and validation results are stored in the configured database.",
    tags: ["Python", "FastAPI", "OCR", "PostgreSQL", "Docker"],
    groups: ["ai", "apps"], art: "dockflow", stamp: "FEATURED BUILD", private: false, featured: true
  },
  {
    slug: "card-risk-analytics",
    name: "Card Risk Analytics with PySpark",
    repo: "card-risk-analytics",
    demo: "https://malhar02.github.io/card-risk-analytics/",
    category: "Data & risk analytics",
    short: "Fraud triage, credit default & review capacity",
    brief: "A public-data project exploring two distinct payment-risk questions: how transaction-fraud review thresholds affect fraud capture and false-alert workload, and how credit-default risk is distributed across scored account groups.",
    outcome: "PySpark workflows validate and model the separate datasets, evaluate a chronological fraud holdout and review thresholds, and summarize credit-default results by risk decile. The repository includes an interactive browser dashboard with filters, searchable tables, and aggregate CSV/JSON exports, plus an Azure Databricks and Power BI handoff.",
    use: "Risk analysts can explore how review capacity and score thresholds change the cases surfaced for human review, then discuss the trade-offs using visible metrics and methodology notes.",
    note: "Uses public ULB fraud and UCI historical credit-default datasets. It does not use American Express data. Scores are ranking signals rather than calibrated probabilities; this portfolio work is not a real-world fraud or lending decision system.",
    tags: ["PySpark", "Python", "Risk analytics", "Azure Databricks", "Power BI"],
    groups: ["data", "ai"], art: "cardrisk", stamp: "RISK SIGNAL LAB", private: false
  },
  {
    slug: "multi-channel-attribution",
    name: "Multi-Channel Sales Attribution",
    repo: "Multi-Channel-Sales-Attribution-analysis-using-postgree-sql-and-power-bi",
    category: "Data & analytics",
    short: "Three ways to give a sale its credit",
    brief: "A marketing attribution study using simulated retail sales and channel interactions. It compares first-click, last-click, and linear attribution instead of assuming one touchpoint tells the whole story.",
    outcome: "PostgreSQL scripts create and analyze the touchpoint data for all three models. A Power BI dashboard brings channel contribution, conversion, and trends together for comparison.",
    use: "Marketing and sales teams can compare how channel credit shifts between models before using attribution results to guide campaign and budget discussions.",
    note: "The project README describes the dataset as synthetic retail data; results are for demonstrating the analysis workflow.",
    tags: ["PostgreSQL", "Power BI", "Marketing analytics"],
    groups: ["data"], art: "attribution", stamp: "SIGNAL MAPPING", private: false
  },
  {
    slug: "customer-churn-analysis",
    name: "Customer Churn Analysis",
    repo: "EDA-CHURN-ANALYSIS",
    category: "Data & machine learning",
    short: "Spotting patterns behind customer churn",
    brief: "An exploratory analysis of telecom customers and the service, payment, contract, and tenure patterns associated with churn.",
    outcome: "The project combines visual analysis with Logistic Regression and Random Forest classifiers, then highlights higher-risk cohorts such as month-to-month customers and newer accounts.",
    use: "A retention team could use cohort analysis to decide where to test earlier customer support, contract options, or payment-method outreach. A model can help prioritize review, not make the decision on its own.",
    note: "The README includes sample findings and recommendations; the portfolio does not present them as guaranteed results for another dataset.",
    tags: ["Python", "Scikit-learn", "Power BI", "EDA"],
    groups: ["data", "ai"], art: "churn", stamp: "PATTERN SPOTTING", private: false
  },
  {
    slug: "postal-address-detection",
    name: "Postal Address Detection",
    repo: "Postal_Address_Detection",
    category: "AI & text processing",
    short: "Find, split & sanity-check addresses",
    brief: "A text-processing concept that finds postal addresses in unstructured text and breaks them into useful parts such as house number, street, city, state, and postal code.",
    outcome: "The repository describes automatic detection, parsing, and validation that can flag incomplete or incorrectly formatted addresses for follow-up.",
    use: "E-commerce, courier, and postal workflows could use address checks to catch incomplete shipping details before a parcel enters fulfillment.",
    note: "The README outlines the intended workflow and possible tools; treat the project as a prototype rather than a production address-verification service.",
    tags: ["Python", "Regex", "NLP", "Validation"],
    groups: ["ai", "apps"], art: "address", stamp: "INFORMATION RETRIEVAL", private: false
  },
  {
    slug: "uma-women-safety-map",
    name: "UMA — Women’s Safety Map",
    repo: "uma-women-safety-map",
    category: "Civic tech · private project",
    short: "News signals & annual aggregate data",
    brief: "A public-interest research prototype that brings candidate news headlines and annual aggregate crime statistics into a map-led view of Indian states and union territories.",
    outcome: "The project provides a React dashboard and FastAPI services for headline feeds, an SQLite archive, analytics, and an optional map layer for dated official aggregate data.",
    use: "Researchers can explore what headline coverage surfaces, follow the original source links, and compare the feed with dated aggregate statistics.",
    note: "This repository is private. Headline counts are not crime or FIR counts, and the map is not a live incident map or a safety score; the README calls out coverage and classification limits.",
    tags: ["React", "FastAPI", "SQLite", "Data visualization"],
    groups: ["data", "apps"], art: "uma", stamp: "PRIVATE BUILD", private: true
  },
  {
    slug: "breast-cancer-analysis",
    name: "Breast Cancer Analysis",
    repo: "breast_cancer_analysis",
    category: "Data & machine learning",
    short: "A classification study with explainable steps",
    brief: "An analysis of the Breast Cancer Wisconsin diagnostic dataset, exploring measurements and comparing models for benign and malignant labels.",
    outcome: "The notebook workflow covers data cleaning, visualization, feature selection, and comparisons of Logistic Regression, Decision Tree, Random Forest, and SVM models using classification metrics.",
    use: "A learning or research exercise for practicing medical-dataset exploration, model comparison, and careful interpretation of classification results.",
    note: "This is a portfolio analysis, not a clinical tool or a substitute for professional diagnosis.",
    tags: ["Python", "Pandas", "Seaborn", "Scikit-learn"],
    groups: ["data", "ai"], art: "cancer", stamp: "DATA EXPLORATION", private: false
  },
  {
    slug: "jarvis-ai-assistant",
    name: "Jarvis AI Assistant",
    repo: "AI-assistant-JARVIS-",
    category: "AI & desktop tools",
    short: "A voice-controlled desktop sidekick",
    brief: "A Python voice assistant that listens for commands, responds out loud, opens common websites or applications, reports the time, and sends other questions to a conversational model.",
    outcome: "The project connects speech recognition, text-to-speech, predefined desktop commands, web search, and an OpenAI chat integration in one assistant prototype.",
    use: "A personal desktop helper for hands-free shortcuts and quick conversational queries while working at a computer.",
    note: "The README describes a Windows-oriented prototype and requires a configured API key for the chat integration.",
    tags: ["Python", "Speech recognition", "OpenAI API"],
    groups: ["ai", "apps"], art: "jarvis", stamp: "BEEP / BOOP", private: false
  },
  {
    slug: "school-management-system",
    name: "School Management System",
    repo: "school_managment_system",
    category: "Apps & systems",
    short: "A relational schema for a school database",
    brief: "A database design for organizing student, teacher, class, subject, and enrollment records, with relationships between the core entities.",
    outcome: "The schema supplies a starting structure for storing school records and querying enrollments, classes, subjects, and teaching assignments.",
    use: "A foundation for a school administration app or database exercise that needs consistent relationships between academic records.",
    note: "The repository README describes a schema and SQL setup workflow; it does not claim a complete school administration application.",
    tags: ["SQL", "MySQL", "Database design"],
    groups: ["apps"], art: "school", stamp: "SYSTEMS THINKING", private: false
  },
  {
    slug: "excel-data-entry-portfolio",
    name: "Excel Data Entry Portfolio",
    repo: "excel-data-entry-portfolio",
    category: "Data & operations",
    short: "Three tidy workflows for messy rows",
    brief: "Three fictional spreadsheet exercises covering CRM record cleanup, accounts-payable invoice reconciliation, and batch-level data-entry quality tracking.",
    outcome: "The CRM workbook marks 104 of 120 sample records ready and 16 for review. The AP sample has 14 ready and 8 review rows; the quality tracker summarizes 3,282 records at 97.7% weighted sample accuracy.",
    use: "Operations teams can use patterns like these to standardize intake, catch duplicates and exceptions, reconcile invoices, and track quality or throughput.",
    note: "All records, people, vendors, and organizations in these workbooks are fictional and were created for portfolio practice.",
    tags: ["Excel", "Data quality", "Validation", "Reconciliation"],
    groups: ["data", "apps"], art: "excel", stamp: "TIDY DATA CLUB", private: false
  }
];

const grid = document.querySelector("#project-grid");
const count = document.querySelector("#visible-count");
const emptyState = document.querySelector("#empty-state");
const filters = [...document.querySelectorAll(".filter-chip")];
const detailPage = document.querySelector("#detail-page");
const detailContent = document.querySelector("#detail-content");
const playlistSections = [...document.querySelectorAll(".hero, .ticker, .projects-section, .about-strip, .profile-section")];
const githubBase = "https://github.com/malhar02/";

function artMarkup(kind) {
  const art = {
    dockflow: `<div class="art-board dock-board"><div class="mini-window"><div class="window-top"><i></i><i></i><i></i><span>INCOMING / 024.PDF</span></div><div class="paper-row"><b>DOC</b><span>COMMERCIAL INVOICE</span><strong>96%</strong></div><div class="paper-lines"><i></i><i></i><i></i></div><div class="mini-status"><span>✓ VERIFIED FIELDS</span><span>03 NEED REVIEW</span></div></div><span class="art-orbit-dot"></span><span class="art-scribble">ZIP!</span></div>`,
    attribution: `<div class="art-board attr-board"><div class="art-label">WHO GETS THE CREDIT?</div><div class="path-line"><i>AD</i><b></b><i>MAIL</i><b></b><i>SALE</i></div><div class="bar-chart"><i style="--bar:39%"></i><i style="--bar:74%"></i><i style="--bar:54%"></i><i style="--bar:91%"></i><i style="--bar:62%"></i></div><span class="chart-note">3 MODELS / 1 BIG QUESTION</span><span class="art-spark">✳</span></div>`,
    churn: `<div class="art-board churn-board"><div class="chart-head"><span>STAY / GO?</span><b>↗</b></div><div class="line-chart"><svg viewBox="0 0 280 100" aria-hidden="true"><path d="M4 78 C35 74 36 55 62 62 S95 42 116 53 149 31 174 43 207 19 228 31 253 11 276 17"/><path class="chart-fill" d="M4 78 C35 74 36 55 62 62 S95 42 116 53 149 31 174 43 207 19 228 31 253 11 276 17V100H4Z"/></svg></div><div class="chart-foot"><span>LOW TENURE</span><b>CHURN SIGNAL ↑</b></div><span class="art-sticker-mini">DATA<br />DETECTIVE</span></div>`,
    address: `<div class="art-board address-board"><div class="address-head">ADDRESS<br /><b>DETECTIVE</b></div><div class="pin-route"><span class="pin pin-one"></span><i></i><span class="pin pin-two"></span></div><div class="address-slip"><span>221B</span><i></i><i></i><b>✓ VALID</b></div><span class="address-glint">✳</span></div>`,
    uma: `<div class="art-board uma-board"><div class="uma-title">UMA <span>FIELD NOTES</span></div><div class="tile-map"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="uma-foot"><b>HEADLINE SIGNALS</b><span>INDIA / MAP VIEW</span></div><span class="lock-stamp">PRIVATE<br />BUILD</span></div>`,
    cancer: `<div class="art-board cancer-board"><div class="cell-cell cell-a"></div><div class="cell-cell cell-b"></div><div class="cell-cell cell-c"></div><div class="cell-cell cell-d"></div><div class="scan-ring"></div><span class="scan-label">CELL / 08</span><span class="scan-badge">BENIGN<br /><b>?</b><br />MALIGNANT</span></div>`,
    jarvis: `<div class="art-board jarvis-board"><div class="robot-head"><span class="bot-ear"></span><span class="bot-eye"></span><span class="bot-eye"></span><span class="bot-mouth"></span><span class="bot-ear right"></span></div><div class="voice-wave"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><span class="jarvis-label">LISTENING...<b>●</b></span><span class="jarvis-zap">BZZT!</span></div>`,
    school: `<div class="art-board school-board"><div class="school-badge">CLASS<br /><b>01</b></div><div class="schema-box box-students"><span>STUDENTS</span><i>student_id</i><i>class_id</i></div><div class="schema-box box-classes"><span>CLASSES</span><i>class_id</i><i>teacher_id</i></div><div class="schema-link"></div><div class="school-foot">GOOD SYSTEMS<br />MAKE ROOM TO LEARN</div></div>`,
    excel: `<div class="art-board excel-board"><div class="sheet-title"><span>ƒx</span> LITTLE SPREADSHEET MAGIC</div><div class="sheet-grid"><span></span><span>A</span><span>B</span><span>C</span><span>01</span><i>✓</i><i>✓</i><i>!</i><span>02</span><i>✓</i><i>✓</i><i>✓</i><span>03</span><i>!</i><i>✓</i><i>✓</i></div><span class="excel-sticker">ALL<br />TIDY!</span></div>`,
    cardrisk: `<div class="art-board risk-board"><div class="risk-head"><span>PAYMENT SIGNALS</span><b>02 / 02</b></div><div class="risk-meter"><div class="risk-meter-ring"><i></i></div><strong>RISK<br />REVIEW</strong></div><div class="risk-bars"><i style="--risk-bar:38%"></i><i style="--risk-bar:66%"></i><i style="--risk-bar:88%"></i><i style="--risk-bar:53%"></i><i style="--risk-bar:74%"></i></div><div class="risk-foot"><span>FRAUD TRIAGE</span><span>DEFAULT DECILES</span></div></div>`
  };
  return art[kind] || "";
}

function trackMarkup(project, index) {
  const number = String(index + 1).padStart(2, "0");
  const tags = project.tags.slice(0, 2).map(tag => `<span>${tag}</span>`).join("");
  const privateTag = project.private ? `<span class="track-private">🔒 PRIVATE</span>` : "";
  return `<a class="playlist-row" href="#project/${project.slug}" aria-label="Open project page for ${project.name}">
    <span class="track-number">${number}</span>
    <span class="track-cover art-${project.art}"><span class="card-art art-${project.art}">${artMarkup(project.art)}</span></span>
    <span class="track-main"><strong>${project.name}</strong><small>${project.short}</small></span>
    <span class="track-kind">${project.category}</span>
    <span class="track-tags">${tags}${privateTag}</span>
    <span class="track-action" aria-hidden="true">↗</span>
  </a>`;
}

function render(filter = "all") {
  const visible = projects.map((project, index) => ({ project, index }))
    .filter(({ project }) => filter === "all" || project.groups.includes(filter));
  grid.innerHTML = visible.map(({ project, index }) => trackMarkup(project, index)).join("");
  count.textContent = `${String(visible.length).padStart(2, "0")} PROJECT${visible.length === 1 ? "" : "S"} IN ROTATION`;
  emptyState.hidden = visible.length > 0;
}

function detailMarkup(project) {
  const index = projects.indexOf(project);
  const tags = project.tags.map(tag => `<span class="tag">${tag}</span>`).join("");
  const privateBadge = project.private ? `<span class="detail-private">🔒 PRIVATE REPOSITORY</span>` : `<span class="detail-public">PUBLIC REPOSITORY</span>`;
  const demoLink = project.demo ? `<a class="demo-button" href="${project.demo}" target="_blank" rel="noreferrer">Open live dashboard <span aria-hidden="true">↗</span></a>` : "";
  return `<article class="project-detail">
    <div class="detail-topline"><a class="back-to-playlist" href="#projects"><span aria-hidden="true">←</span> Back to the playlist</a><span>CASE FILE / ${String(index + 1).padStart(2, "0")}</span></div>
    <div class="detail-hero-row">
      <div class="detail-cover-large art-${project.art}"><span class="card-art art-${project.art}">${artMarkup(project.art)}</span><span class="detail-cover-stamp">${project.stamp}</span></div>
      <div class="detail-heading">
        <div class="detail-meta">${privateBadge}<span>${project.category}</span></div>
        <h1>${project.name}</h1>
        <p>${project.short}</p>
        <div class="detail-tags">${tags}</div>
        <div class="detail-actions"><a class="repo-button" href="${githubBase}${project.repo}" target="_blank" rel="noreferrer">Open GitHub repository <span aria-hidden="true">↗</span></a>${demoLink}<span class="repo-path">github.com/malhar02/${project.repo}</span></div>
      </div>
    </div>
    <div class="detail-grid">
      <section class="detail-block detail-brief"><div class="detail-block-title"><b>01</b><span>THE BRIEF</span></div><p>${project.brief}</p></section>
      <section class="detail-block detail-outcome"><div class="detail-block-title"><b>02</b><span>WHAT CAME OUT OF IT</span></div><p>${project.outcome}</p></section>
      <section class="detail-block detail-use"><div class="detail-block-title"><b>03</b><span>WHERE IT COULD BE USEFUL</span></div><p>${project.use}</p></section>
    </div>
    <aside class="project-note"><span>LINER NOTE</span><p>${project.note}</p></aside>
    <div class="detail-bottom"><a class="back-to-playlist" href="#projects"><span aria-hidden="true">←</span> Back to all ${projects.length} projects</a><a class="detail-github" href="${githubBase}${project.repo}" target="_blank" rel="noreferrer">VIEW SOURCE ON GITHUB ↗</a></div>
  </article>`;
}

function showRoute() {
  const match = window.location.hash.match(/^#project\/([^/]+)$/);
  const project = match && projects.find(item => item.slug === decodeURIComponent(match[1]));
  playlistSections.forEach(section => { section.hidden = Boolean(project); });
  detailPage.hidden = !project;
  if (project) {
    detailContent.innerHTML = detailMarkup(project);
    document.title = `${project.name} — Bibhabasu Bhattacharya`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    document.title = "Bibhabasu Bhattacharya — Greenroom / Project Playlist";
  }
}

filters.forEach(button => {
  button.addEventListener("click", () => {
    filters.forEach(item => {
      const selected = item === button;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    render(button.dataset.filter);
  });
});

render();
document.querySelector("#year").textContent = new Date().getFullYear();
window.addEventListener("hashchange", showRoute);
showRoute();

