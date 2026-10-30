(function (root) {
  "use strict";

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .toLowerCase();
  }

  function canonicalUrl(input) {
    try {
      const url = new URL(input);
      if (url.protocol !== "https:" || !(url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com"))) return null;
      const match = url.pathname.match(/^\/jobs\/view\/(?:[^/]*-)?(\d+)\/?$/);
      return match ? `https://www.linkedin.com/jobs/view/${match[1]}` : null;
    } catch { return null; }
  }

  function validDate(year, month, day) {
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day)
      ? date.toISOString() : null;
  }

  function parseDate(text) {
    const value = normalize(text);
    if (/\b(aujourd hui|today)\b/.test(value)) return new Date().toISOString();
    if (/\b(hier|yesterday)\b/.test(value)) return new Date(Date.now() - 86400000).toISOString();
    let match = value.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
    if (match) return validDate(match[1], match[2], match[3]);
    match = value.match(/\b(\d{1,2})[\s/-]+(\d{1,2})[\s/-]+(\d{4})\b/);
    if (match) return validDate(match[3], match[2], match[1]);
    const months = {
      janvier: 1, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, aout: 8,
      septembre: 9, octobre: 10, novembre: 11, decembre: 12, january: 1, february: 2,
      march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10,
      november: 11, december: 12,
    };
    const names = Object.keys(months).join("|");
    match = value.match(new RegExp(`\\b(\\d{1,2})\\s+(${names})\\s+(\\d{4})\\b`));
    if (match) return validDate(match[3], months[match[2]], match[1]);
    match = value.match(new RegExp(`\\b(${names})\\s+(\\d{1,2})(?:st|nd|rd|th)?[,]?\\s+(\\d{4})\\b`));
    if (match) return validDate(match[3], months[match[1]], match[2]);
    match = value.match(/\b(\d+)\s*\+?\s*(jours?|days?|semaines?|weeks?|mois|months?|ans?|years?)\b/);
    if (!match) return null;
    const units = { jour: 1, jours: 1, day: 1, days: 1, semaine: 7, semaines: 7, week: 7, weeks: 7, mois: 30, month: 30, months: 30, an: 365, ans: 365, year: 365, years: 365 };
    const date = new Date(Date.now() - Number(match[1]) * units[match[2]] * 86400000);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }

  // Negation is scoped to the clause containing a signal, never the entire offer.
  function hasAffirmativeMatch(plain, pattern) {
    return plain.split(/[.!?;\n]+|\b(?:mais|but)\b/).some((clause) => {
      const match = pattern.exec(clause);
      if (!match) return false;
      const before = clause.slice(Math.max(0, match.index - 65), match.index);
      return !/\b(?:ne|n|pas|aucun|sans|jamais|not|no|never|without|don t|doesn t)\b(?:\s+[a-z]+){0,5}\s*$/.test(before);
    });
  }

  function assessText(text, publishedAt, history) {
    const signals = [];
    const plain = normalize(text);
    if (publishedAt && Date.now() - Date.parse(publishedAt) >= 90 * 86400000) {
      signals.push({
        title: "Publication ancienne",
        detail:
          "L’annonce semble en ligne depuis au moins 90 jours. Cela peut aussi s’expliquer par un métier en tension ou un recrutement continu.",
      });
    }
    if (
      history &&
      Date.parse(history.lastSeenAt) - Date.parse(history.firstSeenAt) >= 90 * 86400000 &&
      history.observations >= 2
    ) {
      signals.push({
        title: "Offre observée sur la durée",
        detail:
          "Wokra a observé cette même annonce sur au moins 90 jours. Cela ne prouve pas une présence continue.",
      });
    }
    if (hasAffirmativeMatch(plain, /\b(?:(?:constitu(?:er|e|ons)|aliment(?:er|ons)|rejoindre) (?:notre |un |le )?(?:vivier|reserve de candidats)|constitution d un vivier|(?:join|build|building|maintain|maintaining) (?:our |a |the )?(?:talent pool|candidate pool))\b/)) {
      signals.push({
        title: "Mention d’un vivier de candidats",
        detail:
          "Le texte évoque une réserve de candidatures. Demandez si un poste est disponible maintenant.",
      });
    }
    if (hasAffirmativeMatch(plain, /\b(?:(?:sous reserve (?:de|d)|conditionne a|dans l attente de) (?:la signature|l obtention|(?:un |du |le |d un )?(?:futur contrat|contrat|marche|financement))|(?:subject to|contingent on|pending) (?:the |a |an )?(?:contract|funding|financing|budget|approval))\b/)) {
      signals.push({
        title: "Recrutement soumis à une condition",
        detail: "Le poste semble dépendre d’un contrat, d’un marché ou d’un financement à obtenir.",
      });
    }
    const temporal = signals.some((signal) => /ancienne|duree/.test(normalize(signal.title)));
    const families =
      Number(temporal) +
      signals.filter((signal) => /vivier|condition/.test(normalize(signal.title))).length;
    const level = families >= 2 ? "multiple" : signals.length ? "review" : "unknown";
    return {
      level,
      label: {
        unknown: "Données insuffisantes",
        review: "Points à vérifier",
        multiple: "Plusieurs indices à vérifier",
      }[level],
      signals,
    };
  }

  function analyzeJob(input) {
    const title = input.title || "Offre LinkedIn";
    const description = input.description || input.text || "";
    return Object.assign(
      {
        title,
        company: input.company || "Entreprise non précisée",
        location: input.location || "Lieu non précisé",
        url: canonicalUrl(input.url) || "",
        publishedAt: input.publishedAt || null,
      },
      assessText(description, input.publishedAt, input.history),
    );
  }

  root.WokraDetector = { normalize, canonicalUrl, parseDate, assessText, analyzeJob };
})(typeof globalThis !== "undefined" ? globalThis : self);
