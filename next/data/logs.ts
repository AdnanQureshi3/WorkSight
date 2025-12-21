import { LogEntry } from "@/types/types";
export const RAW_DAILY_LOG: LogEntry[] = [
  { id: 1, app: "VS Code", log: "Refactoring IPC types 1h 15m", timeStart: "09:00", timeEnd: "10:15" },
  { id: 2, app: "Chrome", log: "Next.js Static Exports Docs 45m, Twitter Scroll 15m", timeStart: "10:15", timeEnd: "11:15" },
  { id: 3, app: "YouTube", log: "Coding Tutorial 1h 0m, Songs 1h 30m", timeStart: "11:15", timeEnd: "13:45" },
  { id: 4, app: "Figma", log: "UX Review 45m", timeStart: "13:45", timeEnd: "14:30" },
];

const WEEKLY_DATA = [
  { day: 'Mon', work: 5, distraction: 1.5, score: 75 },
  { day: 'Tue', work: 6, distraction: 0.5, score: 88 },
  { day: 'Wed', work: 4, distraction: 2.0, score: 65 },
  { day: 'Thu', work: 7, distraction: 0.3, score: 92 },
  { day: 'Fri', work: 5, distraction: 1.0, score: 80 },
];