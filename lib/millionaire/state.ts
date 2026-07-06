// App state machine types

export type ScreenId =
  | "menu"
  | "customize"            // question editor
  | "history"              // past game records
  | "intro_video"          // placeholder video screen
  | "welcome"
  | "contestant_intro"
  | "contestant_form"
  | "transition_video"     // placeholder video screen
  | "transition_background" // background image with lower third
  | "introduction"         // money ladder + lifelines intro
  | "gameplay"
  | "end_walk_away"
  | "end_win"
  | "end_lose"
  | "outro";

export interface ContestantInfo {
  name: string;
  location: string;
}

export type AnswerState = "default" | "hover" | "selected" | "correct" | "wrong" | "disabled";

export interface GameState {
  screen: ScreenId;
  contestant: ContestantInfo;
  currentLevel: number;     // 1-15
  finalLevel: number;       // highest level reached
  walkedAway: boolean;
  usedLifelines: Set<string>;
  disabledAnswers: Set<number>;  // for 50:50
  selectedAnswer: number | null;
  revealedAnswer: number | null;
  doubleDipActive: boolean;
  doubleDipGuessesLeft: number;
  audiencePoll: number[] | null;
  phoneGuess: number | null;
  showPhoneModal: boolean;
  showAudienceModal: boolean;
  showFinalConfirm: boolean;
}
