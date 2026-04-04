import { deepNormalizeArabic } from "@/utils/quran-force-align";

export interface AiFeedback {
  score: number;
  overallFeedback: string;
  errors: { word: string; type: string; correction: string }[];
  tajwidNotes: string[];
  encouragement: string;
}

const EXACT_MATCH_THRESHOLD = 0.80;
const NEAR_MATCH_THRESHOLD = 0.55;

export function evaluateRecitationLocally(expectedText: string, transcription: string): AiFeedback {
  const expectedWords = deepNormalizeArabic(expectedText).split(" ").filter(Boolean);
  const spokenWords = deepNormalizeArabic(transcription).split(" ").filter(Boolean);

  if (expectedWords.length === 0 || spokenWords.length === 0) {
    return {
      score: 0,
      overallFeedback: "Aucune récitation exploitable n'a été détectée.",
      errors: [],
      tajwidNotes: [
        "Parle plus distinctement et rapproche-toi du microphone avant de recommencer.",
      ],
      encouragement: "Réessaie calmement, mot par mot.",
    };
  }

  const errors: AiFeedback["errors"] = [];
  let expectedIndex = 0;
  let spokenIndex = 0;
  let exactMatches = 0;
  let nearMatchesWeight = 0;
  let missingCount = 0;
  let addedCount = 0;
  let mispronouncedCount = 0;

  while (expectedIndex < expectedWords.length || spokenIndex < spokenWords.length) {
    const expectedWord = expectedWords[expectedIndex];
    const spokenWord = spokenWords[spokenIndex];

    if (expectedWord && spokenWord) {
      const similarity = levenshteinSimilarity(expectedWord, spokenWord);

      if (similarity >= EXACT_MATCH_THRESHOLD) {
        exactMatches += 1;
        expectedIndex += 1;
        spokenIndex += 1;
        continue;
      }

  const nextSpokenMatches = spokenWords[spokenIndex + 1]
        ? levenshteinSimilarity(expectedWord, spokenWords[spokenIndex + 1]) >= EXACT_MATCH_THRESHOLD
        : false;
      const nextExpectedMatches = expectedWords[expectedIndex + 1]
        ? levenshteinSimilarity(expectedWords[expectedIndex + 1], spokenWord) >= EXACT_MATCH_THRESHOLD
        : false;

      if (nextSpokenMatches && !nextExpectedMatches) {
        addedCount += 1;
        errors.push({
          word: spokenWord,
          type: "added",
          correction: `Le mot « ${spokenWord} » semble avoir été ajouté. Suis le texte mot à mot.`,
        });
        spokenIndex += 1;
        continue;
      }

      if (nextExpectedMatches) {
        missingCount += 1;
        errors.push({
          word: expectedWord,
          type: "missing",
          correction: `Le mot « ${expectedWord} » a été sauté. Reprends plus lentement à partir de ce mot.`,
        });
        expectedIndex += 1;
        continue;
      }

      mispronouncedCount += 1;
      nearMatchesWeight += similarity >= NEAR_MATCH_THRESHOLD ? similarity : 0;
      errors.push({
        word: expectedWord,
        type: "mispronounced",
        correction:
          similarity >= NEAR_MATCH_THRESHOLD
            ? `Prononciation proche, mais à corriger sur « ${expectedWord} ». Tu as dit « ${spokenWord} ».`
            : `Le mot attendu est « ${expectedWord} ». Réécoute-le puis répète-le lentement.`,
      });
      expectedIndex += 1;
      spokenIndex += 1;
      continue;
    }

    if (expectedWord) {
      missingCount += 1;
      errors.push({
        word: expectedWord,
        type: "missing",
        correction: `Le mot « ${expectedWord} » manque à la fin de la récitation.`,
      });
      expectedIndex += 1;
      continue;
    }

    if (spokenWord) {
      addedCount += 1;
      errors.push({
        word: spokenWord,
        type: "added",
        correction: `Le mot « ${spokenWord} » ne fait pas partie du passage demandé.`,
      });
      spokenIndex += 1;
    }
  }

  const weightedMatches = exactMatches + nearMatchesWeight * 0.6;
  const baseScore = (weightedMatches / expectedWords.length) * 100;
  const penalty = missingCount * 6 + addedCount * 4 + mispronouncedCount * 2;
  const score = clamp(Math.round(baseScore - penalty), 0, 100);

  const tajwidNotes = buildTajwidNotes({ missingCount, addedCount, mispronouncedCount, score });

  return {
    score,
    overallFeedback: buildOverallFeedback(score, errors.length),
    errors: errors.slice(0, 12),
    tajwidNotes,
    encouragement: buildEncouragement(score),
  };
}

function buildOverallFeedback(score: number, errorsCount: number) {
  if (score >= 90) return "Très bien, ta récitation est bonne !";
  if (score >= 75) return `C'est bien, quelques petites corrections à faire.`;
  if (score >= 50) return "Pas mal, mais reprends plus lentement certains mots.";
  return "Il faut reprendre ce passage plus doucement, mot par mot.";
}

function buildEncouragement(score: number) {
  if (score >= 90) return "Excellent travail, continue ainsi !";
  if (score >= 75) return "Tu progresses bien, concentre-toi sur les mots signalés.";
  if (score >= 50) return "Tu es sur la bonne voie : réécoute puis recommence calmement.";
  return "Ne te décourage pas : avance lentement et corrige un mot à la fois.";
}

function buildTajwidNotes(params: { missingCount: number; addedCount: number; mispronouncedCount: number; score: number }) {
  const notes: string[] = [];

  if (params.mispronouncedCount > 0) {
    notes.push("Travaille les makharij et distingue mieux les lettres proches avant d'accélérer.");
    notes.push("Soigne les allongements (madd) et articule chaque mot entièrement.");
  }

  if (params.missingCount > 0) {
    notes.push("Ralentis légèrement pour éviter de sauter des mots ou des segments entiers.");
  }

  if (params.addedCount > 0) {
    notes.push("Garde les yeux sur le texte pour éviter d'ajouter des mots non demandés.");
  }

  if (notes.length === 0) {
    notes.push("Continue à soigner la clarté des lettres et la régularité du rythme.");
  }

  if (params.score < 60) {
    notes.push("Réécoute la récitation modèle puis répète le passage par petits groupes de mots.");
  }

  return notes.slice(0, 4);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function levenshteinSimilarity(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= a.length; i++) matrix[i] = [i];
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }

  const maxLength = Math.max(a.length, b.length);
  return maxLength === 0 ? 1 : 1 - matrix[a.length][b.length] / maxLength;
}