const FIELD_TERMS = {
  taal: ["taal", "tal", "rhythm", "তাল"],
  parjaay: ["parjaay", "parjay", "পর্যায়", "পর্যায়"],
  raag: ["raag", "raga", "রাগ"],
  ritu: ["ritu", "rhitu", "season", "ঋতু"],
  written_on: ["written on", "written", "year", "when was"],
  collection: ["collection", "book"],
  swarabitan: ["swarabitan"],
  notation_by: ["notation by", "notator"],
};

const FIELD_LABELS = {
  taal: "taal",
  parjaay: "parjaay",
  raag: "raag",
  ritu: "ritu / season",
  written_on: "written on",
  collection: "collection",
  swarabitan: "Swarabitan",
  notation_by: "notation credit",
};

const STOP_WORDS = new Set(
  "what is the of for in this that song songs tell me about which find list show give use uses using are was were by and do does".split(" ")
);

let catalogue = [];
let ready = false;

function normalize(value) {
  return (value || "")
    .toLocaleLowerCase()
    .normalize("NFC")
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, " ")
    .trim();
}

function detectField(question) {
  const lower = question.toLocaleLowerCase();
  return Object.entries(FIELD_TERMS).find(([, terms]) =>
    terms.some((term) => lower.includes(term))
  )?.[0] || null;
}

function cleanQuery(question, field) {
  const words = normalize(question).split(/\s+/).filter(Boolean);
  const ignored = new Set(STOP_WORDS);
  if (field) {
    for (const term of FIELD_TERMS[field]) {
      for (const word of normalize(term).split(/\s+/)) ignored.add(word);
    }
  }
  return words.filter((word) => !ignored.has(word));
}

function titleScore(row, query, queryWords) {
  const title = normalize(row.title_roman);
  if (!title) return 0;
  if (title.length > 2 && query.includes(title)) return 1;
  const titleWords = new Set(title.split(/\s+/));
  const overlap = [...titleWords].filter((word) => queryWords.includes(word)).length;
  return overlap / Math.max(1, titleWords.size);
}

function findBestSong(question, field) {
  const query = normalize(question);
  const cleanedWords = cleanQuery(question, field);
  const cleaned = cleanedWords.join(" ");
  let best = null;
  let bestScore = 0;
  for (const row of catalogue) {
    const score = Math.max(
      titleScore(row, query, cleanedWords),
      titleScore(row, cleaned, cleanedWords)
    );
    if (score > bestScore) {
      best = row;
      bestScore = score;
    }
  }
  return { row: best, score: bestScore, cleanedWords };
}

function metadataSummary(row) {
  const fields = ["parjaay", "taal", "raag", "ritu", "written_on", "collection", "swarabitan", "notation_by"];
  return fields
    .filter((field) => row[field])
    .map((field) => FIELD_LABELS[field] + ": " + row[field]);
}

function answerQuestion(question) {
  if (!catalogue.length) {
    return { text: "The song catalogue has not loaded yet. Please refresh in a moment.", rows: [] };
  }

  const field = detectField(question);
  const match = findBestSong(question, field);
  const row = match.row;
  const matchedSong = row && match.score >= 0.5;

  if (matchedSong) {
    if (field) {
      const value = row[field] || "not listed on this song page";
      return {
        text: row.title_roman + ": " + FIELD_LABELS[field] + " is " + value + ".",
        rows: [row],
      };
    }
    const details = metadataSummary(row);
    return {
      text: row.title_roman + ": " + (details.length ? details.join(" · ") : "No structured metadata is listed on this page."),
      rows: [row],
    };
  }

  if (field && match.cleanedWords.length) {
    const value = normalize(match.cleanedWords.join(" "));
    const matches = catalogue
      .filter((item) => normalize(item[field]).includes(value))
      .slice(0, 12);
    if (matches.length) {
      return {
        text: "I found " + (matches.length === 12 ? "at least 12" : matches.length) +
          " song records with " + FIELD_LABELS[field] + " matching “" + match.cleanedWords.join(" ") + "”.",
        rows: matches,
      };
    }
  }

  const fallbackWords = cleanQuery(question, null);
  const searchMatches = catalogue
    .map((item) => ({ item, score: titleScore(item, normalize(question), fallbackWords) }))
    .filter((result) => result.score >= 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((result) => result.item);

  if (searchMatches.length) {
    return { text: "I couldn't identify the exact song. These titles may be what you meant:", rows: searchMatches };
  }

  return {
    text: "I couldn't match that to a song record. Try a Romanized title, or ask for taal, parjaay, raag, ritu/season, year, collection, or notation credit.",
    rows: [],
  };
}

function validSourceUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && (url.hostname === "geetabitan.com" || url.hostname.endsWith(".geetabitan.com"))
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function appendMessage(text, kind, rows = []) {
  const conversation = document.getElementById("conversation");
  const message = document.createElement("article");
  message.className = "message " + (kind === "user" ? "user-message" : "assistant-message");

  const label = document.createElement("div");
  label.className = "message-label";
  label.textContent = kind === "user" ? "YOU" : "TAGOREGPT";
  message.appendChild(label);

  const paragraph = document.createElement("p");
  paragraph.textContent = text;
  message.appendChild(paragraph);

  if (rows.length) {
    const list = document.createElement("ul");
    list.className = "answer-list";
    for (const row of rows) {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = row.title_roman || "Untitled song";
      item.appendChild(title);

      const details = metadataSummary(row);
      if (details.length) item.appendChild(document.createTextNode(" — " + details.join(" · ")));

      const source = validSourceUrl(row.source_url);
      if (source) {
        const link = document.createElement("a");
        link.className = "source-link";
        link.href = source;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Open source page ↗";
        item.appendChild(document.createTextNode(" "));
        item.appendChild(link);
      }
      list.appendChild(item);
    }
    message.appendChild(list);
  }

  conversation.appendChild(message);
  conversation.scrollTop = conversation.scrollHeight;
}

async function loadCatalogue() {
  const status = document.getElementById("data-status");
  const dot = document.querySelector(".status-dot");
  try {
    const response = await fetch("./songs.json", { cache: "no-cache" });
    if (!response.ok) throw new Error("Catalogue request failed (" + response.status + ")");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Catalogue format is invalid");
    catalogue = data;
    ready = true;
    status.textContent = catalogue.length.toLocaleString() + " song records ready";
    dot.classList.add("ready");
    document.getElementById("song-count").textContent = catalogue.length.toLocaleString();
    document.getElementById("database-download").hidden = false;
  } catch (error) {
    status.textContent = "Catalogue is not ready";
    dot.classList.add("error");
    appendMessage("The online catalogue hasn't finished its first build yet. Try again after the GitHub Pages deployment completes.", "assistant");
    console.error(error);
  }
}

document.getElementById("question-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!ready) return;
  const input = document.getElementById("question-input");
  const question = input.value.trim();
  if (!question) return;
  appendMessage(question, "user");
  const result = answerQuestion(question);
  appendMessage(result.text, "assistant", result.rows);
  input.value = "";
  input.focus();
});

document.querySelectorAll("[data-question]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!ready) return;
    const question = button.getAttribute("data-question");
    appendMessage(question, "user");
    const result = answerQuestion(question);
    appendMessage(result.text, "assistant", result.rows);
  });
});

loadCatalogue();

