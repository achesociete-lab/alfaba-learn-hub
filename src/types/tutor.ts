export interface TutorQuestion {
  type: "mcq" | "text";
  prompt_fr: string;
  display: string;
  translit?: string;
  meaning_fr?: string;
  highlight?: string;
  choices?: string[];
  correct_index?: number;
}

export interface TutorPayload {
  feedback_fr: string;
  feedback_ar: string;
  question: TutorQuestion | null;
}
