(function (root) {
  "use strict";

  function normalize(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[’']/g, " ")
      .toLowerCase();
  }

  function parseDate(text) {
    const value = normalize(text);
    if (/\b(aujourd hui|today)\b/.test(value)) return new Date().toISOString();
    if (/\bhier|yesterday\b/.test(value))
      return new Date(Date.now() - 86400000).toISOString();
    const absolute = value.match(/\b(\d{1,2})[\s/-]+(\d{1,2})[\s/-]+(\d{4})\b/);
    if (absolute) {
      const date = new Date(Date.UTC(Number(absolute[3]), Number(absolute[2]) - 1, Number(absolute[1])));
      if (Number.isFinite(date.getTime())) return date.toISOString();
    }
    const named = value.match(/\b(\d{1,2})\s+(janvier|fevrier|mars|avril|mai|juin|juillet|aout|septembre|octobre|novembre|decembre|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})\b/);
    if (named) {
      const months = {
        janvier: 0, fevrier: 1, mars: 2, avril: 3, mai: 4, juin: 5, juillet: 6, aout: 7,
        septembre: 8, octobre: 9, novembre: 10, decembre: 11, january: 0, february: 1,
        march: 2, april: 3, may: 4, june: 5, july: 6, august: 7, september: 8, october: 9,
        november: 10, december: 11,
      };
      const date = new Date(Date.UTC(Number(named[3]), months[named[2]], Number(named[1])));
      if (Number.isFinite(date.getTime())) return date.toISOString();
    }
    const match = value.match(/(\d+)\s*\+?\s*(jours?|days?|semaines?|weeks?|mois|months?|ans?|years?)/);
    if (!match) return null;
    const amount = Number(match[1]);
    const multiplier = {
      jour: 1, jours: 1, day: 1, days: 1,
      semaine: 7, semaines: 7, week: 7, weeks: 7,
      mois: 30, month: 30, months: 30,
      an: 365, ans: 365, year: 365, years: 365,
    }[match[2]];
    if (!multiplier) return null;
    return new Date(Date.now() - amount * multiplier * 86400000).toISOString();
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
    if (
      /\b(constitu(er|e|ons)|aliment(er|ons)|rejoindre) (notre |un |le )?(vivier|reserve de candidats)\b|\bconstitution d.?un vivier\b/.test(
        plain,
      ) &&
      !/\b(ne|pas|aucun|sans|jamais)\b/.test(plain)
    ) {
      signals.push({
        title: "Mention d’un vivier de candidats",
        detail:
          "Le texte évoque une réserve de candidatures. Demandez si un poste est disponible maintenant.",
      });
    }
    if (
      /\b(sous reserve de|sous reserve d|conditionne a|dans l.attente de) (la signature|l.obtention|un contrat|un marche|un financement|un futur contrat)\b/.test(
        plain,
      )
    ) {
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
        url: input.url || "",
        publishedAt: input.publishedAt || null,
      },
      assessText(description, input.publishedAt, input.history),
    );
  }

  root.WokraDetector = { normalize, parseDate, assessText, analyzeJob };
})(typeof globalThis !== "undefined" ? globalThis : self);
