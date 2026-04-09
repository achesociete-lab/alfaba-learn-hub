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
          correction: `Mot en trop.`,
        });
        spokenIndex += 1;
        continue;
      }

      if (nextExpectedMatches) {
        missingCount += 1;
        errors.push({
          word: expectedWord,
          type: "missing",
          correction: `Ce mot a été sauté.`,
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
            ? `Prononciation proche mais à corriger.`
            : `Ce mot n'est pas correct, réécoute-le.`,
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
        correction: `Ce mot manque à la fin.`,
      });
      expectedIndex += 1;
      continue;
    }

    if (spokenWord) {
      addedCount += 1;
      errors.push({
        word: spokenWord,
        type: "added",
        correction: `Mot en trop à la fin.`,
      });
      spokenIndex += 1;
    }
  }

  const weightedMatches = exactMatches + nearMatchesWeight * 0.5;
  const baseScore = (weightedMatches / expectedWords.length) * 100;
  const penalty = missingCount * 8 + addedCount * 5 + mispronouncedCount * 4;
  const score = clamp(Math.round(baseScore - penalty), 0, 100);

  // Estimate level based on accuracy
  const accuracy = exactMatches / expectedWords.length;
  const estimatedLevel = accuracy >= 0.85 ? "avancé" : accuracy >= 0.6 ? "intermédiaire" : "débutant";

  

  return {
    score,
    overallFeedback: buildOverallFeedback(score, errors.length, estimatedLevel),
    errors: errors.slice(0, 5),
    tajwidNotes: buildTajwidNotes({ missingCount, addedCount, mispronouncedCount, score, estimatedLevel }),
    encouragement: buildEncouragement(score, estimatedLevel),
  };
}

function buildOverallFeedback(score: number, errorsCount: number, level: string) {
  const levelLabel = level === "avancé" ? "Niveau avancé" : level === "intermédiaire" ? "Niveau intermédiaire" : "Niveau débutant";
  if (score >= 90) return `${levelLabel}. Très bonne récitation, quelques détails à peaufiner.`;
  if (score >= 75) return `${levelLabel}. C'est bien, mais il y a des erreurs de prononciation à corriger.`;
  if (score >= 50) return `${levelLabel}. Plusieurs erreurs détectées, reprends ce passage plus lentement.`;
  return `${levelLabel}. Il faut retravailler ce passage mot par mot en écoutant bien le modèle.`;
}

function buildEncouragement(score: number, level: string) {
  if (level === "débutant") {
    if (score >= 70) return "C'est encourageant pour un début, continue à t'entraîner !";
    return "Réécoute bien chaque mot avant de recommencer, tu vas progresser.";
  }
  if (level === "intermédiaire") {
    if (score >= 75) return "Tu progresses bien, concentre-toi sur les lettres similaires.";
    return "Reprends plus lentement en faisant attention à chaque lettre.";
  }
  if (score >= 85) return "Excellent niveau, travaille les détails de tajwid pour te perfectionner.";
  return "Revois les règles de tajwid pour ce passage.";
}

function buildTajwidNotes(params: { missingCount: number; addedCount: number; mispronouncedCount: number; score: number; estimatedLevel: string }) {
  const notes: string[] = [];

  if (params.mispronouncedCount > 0) {
    if (params.estimatedLevel === "débutant") {
      notes.push("Écoute attentivement chaque mot et essaie de reproduire les sons exactement.");
    } else {
      notes.push("Fais attention aux lettres qui se ressemblent : ح/ه, ص/س, ض/د, ط/ت, ع/أ, ق/ك.");
    }
  }

  if (params.missingCount > 0) {
    notes.push("Tu as sauté des mots. Lis plus lentement en suivant le texte du doigt.");
  }

  if (params.addedCount > 0) {
    notes.push("Tu as ajouté des mots qui ne sont pas dans le texte. Suis bien le mushaf.");
  }

  if (params.estimatedLevel === "avancé" && params.mispronouncedCount > 0) {
    notes.push("Travaille les règles de tajwid : ghunna, idgham, ikhfa et les prolongations (madd).");
  }

  if (notes.length === 0) {
    notes.push("Continue à perfectionner ta prononciation de chaque lettre.");
  }

  return notes.slice(0, 3);
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