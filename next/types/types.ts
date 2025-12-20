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
 
  setView: (v: "dashboard" | "goals" | "history" | "detail") => void;
};
export type SideBarProps = {
    view: "dashboard" | "goals" | "history" | "detail";
    setView: (v: "dashboard" | "goals" | "history" | "detail") => void;
};
