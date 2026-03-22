export type StageStatus = "locked" | "available" | "cleared";

export interface FillTagChallenge {
  type: "fill-tag";
  prompt: string;
  answer: string;
  hint?: string;
}

export interface ArrangeChallenge {
  type: "arrange";
  prompt: string;
  items: string[];
  correctOrder: string[];
}

export interface CodeOutputChallenge {
  type: "code-output";
  prompt: string;
  options: string[];
  correctIndex: number;
}

export interface FixHtmlChallenge {
  type: "fix-html";
  prompt: string;
  broken: string;
  solution: string;
  hint?: string;
}

export interface FreeformChallenge {
  type: "freeform";
  prompt: string;
  initialHtml: string;
  successIf: string;
}

export type Challenge =
  | FillTagChallenge
  | ArrangeChallenge
  | CodeOutputChallenge
  | FixHtmlChallenge
  | FreeformChallenge;

export interface Stage {
  id: string;
  title: string;
  xpReward?: number;
  challenge: Challenge;
}
