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
  "what is a the of for in on this that song songs lyric lyrics line lines tell me about which find list show give use uses using are was were by and do does say says goes from please help identify called named called with says that goes like lyrics of the song".split(" ")
);

let catalogue = [];
let termIndex = new Map();
let ready = false;

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .replace(/[^a-z0-9\u0980-\u09ff]+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalize(value).split(/\s+/).filter((word) => word.length > 1);
}

function detectField(question) {
  const words = new Set(tokenize(question));
  return Object.entries(FIELD_TERMS).find(([, terms]) =>
    terms.some((term) => tokenize(term).every((word) => words.has(word)))
  )?.[0] || null;
}

function cleanQuery(question, field) {
  const words = tokenize(question);
  const ignored = new Set(STOP_WORDS);
  if (field) {
    for (const term of FIELD_TERMS[field]) {
      for (const word of tokenize(term)) ignored.add(word);
    }
  }
  return [...new Set(words.filter((word) => !ignored.has(word)))];
}

function buildSearchIndex() {
  termIndex = new Map();
  catalogue.forEach((row, rowIndex) => {
    const lyricTerms = Array.isArray(row.search_terms) ? row.search_terms : [];
    const terms = new Set([...tokenize(row.title_roman), ...lyricTerms.flatMap(tokenize)]);
    for (const term of terms) {
      if (!termIndex.has(term)) termIndex.set(term, new Set());
      termIndex.get(term).add(rowIndex);
    }
  });
}

function documentFrequency(term) {
  return termIndex.get(term)?.size || 0;
}

function inverseDocumentFrequency(term) {
  const frequency = documentFrequency(term);
  return Math.log(1 + catalogue.length / (frequency + 1));
}

function editDistanceWithin(left, right, limit) {
  if (Math.abs(left.length - right.length) > limit) return limit + 1;
  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    const current = [i];
    let rowMin = i;
    for (let j = 1; j <= right.length; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      rowMin = Math.min(rowMin, current[j]);
    }
    if (rowMin > limit) return limit + 1;
    previous = current;
  }
  return previous[right.length];
}

function matchingTerms(queryWord) {
  if (termIndex.has(queryWord)) return [{ term: queryWord, similarity: 1 }];
  if (queryWord.length < 4) return [];

  const limit = queryWord.length >= 8 ? 2 : 1;
  const candidates = [];
  for (const term of termIndex.keys()) {
    if (term.length < 4 || Math.abs(term.length - queryWord.length) > limit) continue;
    const distance = editDistanceWithin(queryWord, term, limit);
    if (distance <= limit) candidates.push({ term, distance });
  }
  return candidates
    .sort((a, b) => a.distance - b.distance || documentFrequency(a.term) - documentFrequency(b.term))
    .slice(0, 3)
    .map(({ term, distance }) => ({
      term,
      similarity: 1 - distance / Math.max(queryWord.length, term.length),
    }));
}

function findSongMatches(question, field) {
  const queryWords = cleanQuery(question, field);
  const searchableWords = queryWords
    .map((word) => ({ word, variants: matchingTerms(word) }))
    .filter((entry) => entry.variants.length);
  if (!searchableWords.length) return { rows: [], queryWords, searchableWords: [] };

  const totalWeight = searchableWords.reduce((sum, entry) => {
    const bestWeight = Math.max(...entry.variants.map((variant) =>
      inverseDocumentFrequency(variant.term) * variant.similarity
    ));
    return sum + bestWeight;
  }, 0);
  const scores = new Map();

  for (const entry of searchableWords) {
    for (const variant of entry.variants) {
      const termWeight = inverseDocumentFrequency(variant.term) * variant.similarity;
      for (const rowIndex of termIndex.get(variant.term) || []) {
        if (!scores.has(rowIndex)) scores.set(rowIndex, new Map());
        const wordScores = scores.get(rowIndex);
        wordScores.set(entry.word, Math.max(wordScores.get(entry.word) || 0, termWeight));
      }
    }
  }

  const rows = [...scores.entries()].map(([rowIndex, wordScores]) => {
    const row = catalogue[rowIndex];
    const matchedWords = [...wordScores.keys()];
    const matchedWeight = [...wordScores.values()].reduce((sum, value) => sum + value, 0);
    const coverage = matchedWords.length / searchableWords.length;
    const titleTokens = new Set(tokenize(row.title_roman));
    const titleCoverage = queryWords.length
      ? queryWords.filter((word) => titleTokens.has(word)).length / queryWords.length
      : 0;
    const score = Math.min(1, (matchedWeight / totalWeight) * 0.82 + coverage * 0.12 + titleCoverage * 0.06);
    const uniqueTermHits = searchableWords.filter((entry) => {
      if (!wordScores.has(entry.word)) return false;
      return entry.variants.some((variant) =>
        documentFrequency(variant.term) <= 2 && termIndex.get(variant.term)?.has(rowIndex)
      );
    }).length;
    return { row, rowIndex, score, matchedWords, coverage, uniqueTermHits };
  }).sort((a, b) => b.score - a.score || b.matchedWords.length - a.matchedWords.length);

  return { rows, queryWords, searchableWords };
}

function isConfidentMatch(match, runnerUp) {
  const enoughEvidence = match.matchedWords.length >= 2 || match.uniqueTermHits > 0;
  const hasLead = !runnerUp || match.score - runnerUp.score >= 0.08;
  return enoughEvidence && match.score >= 0.58 && (hasLead || match.score >= 0.88);
}

function metadataSummary(row) {
  const fields = ["parjaay", "taal", "raag", "ritu", "written_on", "collection", "swarabitan", "notation_by"];
  const details = fields
    .filter((field) => row[field])
    .map((field) => FIELD_LABELS[field] + ": " + row[field]);

  try {
    const extras = JSON.parse(row.extra_metadata_json || "{}");
    for (const [key, value] of Object.entries(extras)) {
      if (value == null || value === "") continue;
      const label = key.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
      details.push(label + ": " + value);
    }
  } catch {
    // Ignore malformed optional metadata rather than breaking song lookup.
  }
  return details;
}

function formatRows(matches) {
  return matches.map((match) => ({
    ...match.row,
    matched_terms: match.matchedWords,
  }));
}

function answerQuestion(question) {
  if (!catalogue.length) {
    return { text: "The song catalogue has not loaded yet. Please refresh in a moment.", rows: [] };
  }

  const field = detectField(question);
  const match = findSongMatches(question, field);
  const best = match.rows[0];

  if (best && isConfidentMatch(best, match.rows[1])) {
    const details = metadataSummary(best.row);
    const matched = best.matchedWords.join(", ");
    const intro = "Likely song match from your words (“" + matched + "”): " + best.row.title_roman + ". ";
    const fact = field
      ? FIELD_LABELS[field] + " is " + (best.row[field] || "not listed on this song page") + ". "
      : "Here is all the structured information available for this song. ";
    return {
      text: intro + fact + (details.length ? details.join(" · ") : "No structured metadata is listed on this page."),
      rows: formatRows([best]),
    };
  }

  if (field && match.queryWords.length) {
    const value = normalize(match.queryWords.join(" "));
    const fieldMatches = catalogue
      .filter((item) => normalize(item[field]).includes(value) || match.queryWords.some((word) => normalize(item[field]).includes(word)))
      .slice(0, 12);
    if (fieldMatches.length) {
      return {
        text: "I found " + (fieldMatches.length === 12 ? "at least 12" : fieldMatches.length) +
          " song records with " + FIELD_LABELS[field] + " matching “" + match.queryWords.join(" ") + "”.",
        rows: fieldMatches,
      };
    }
  }

  const suggestions = match.rows.filter((entry) => entry.score >= 0.20).slice(0, 8);
  if (suggestions.length) {
    return {
      text: "I found several possible songs from those words. Here are the closest matches with their available details; add another distinctive word if none is right.",
      rows: formatRows(suggestions),
    };
  }

  return {
    text: "I couldn't match those words to a song. Try a few words as they sound in Bengali using English letters, for example “aami ekla cholechhi”.",
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

      if (row.matched_terms?.length) {
        item.appendChild(document.createTextNode(" — matched words: " + row.matched_terms.join(", ")));
      }
      const details = metadataSummary(row);
      if (details.length) item.appendChild(document.createTextNode(" · " + details.join(" · ")));

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
    buildSearchIndex();
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

