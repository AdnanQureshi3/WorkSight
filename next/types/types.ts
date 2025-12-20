export interface LogEntry {
  id: number;
  app: string;
  log: string;
  timeStart: string;
  timeEnd: string;
}
export type ParsedActivity = {
  app: string;
  task: string;
  duration: string;
  type: "work" | "distraction";
  time: string;
};

export type DashboardViewProps = {
  nickname: string;
  aiAnalysis: {
    score: number;
    summary: string;
    suggestion: string;
  } | null;
  isAnalyzing: boolean;
  chatInput: string;
  setChatInput: (v: string) => void;
  chatResponse: string;
  handleAskAI: () => void;
  parsedActivities: ParsedActivity[];
  setView: (v: "dashboard" | "goals" | "history" | "detail") => void;
};
