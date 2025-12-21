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
 
  setView: (v: "dashboard" | "goals" | "history" | "detail" | "profile") => void;
};
export type SideBarProps = {
    view: "dashboard" | "goals" | "history" | "detail" | "profile";
    setView: (v: "dashboard" | "goals" | "history" | "detail" | "profile") => void;
};


export type ProfileProps = {
 
  setView: (v: "dashboard" | "goals" | "history" | "detail" | "profile") => void;
};
export interface Goal {
  id: number;
  name: string;
  current: number;
  target: number;
  unit: string;
}
