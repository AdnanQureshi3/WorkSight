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


export type SideBarProps = {
 setRefresh: React.Dispatch<React.SetStateAction<boolean>>

    view: "dashboard" | "ai" | "history" | "detail" | "profile";
    setView: (v: "dashboard" | "ai" | "history" | "detail" | "profile") => void;
};


export type ProfileProps = {
 
  setView: (v: "dashboard" | "ai" | "history" | "detail" | "profile") => void;
};
// Goals removed — interface retained historically for reference (no longer used).
