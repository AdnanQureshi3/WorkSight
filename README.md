<h2> A desktop productivity app that runs locally on the user’s laptop. </h2>

```
WorkSight/
│
├── electron/
│   ├── main.mts            # Electron main process (window, IPC, app lifecycle)
│   ├── preload.ts          # IPC bridge (compiled to preload.js)
│   ├── preload.js          # Built file used by Electron
│   ├── tsconfig.json       # Electron TypeScript config
│
├── next/
│   ├── app/
│   │   ├── page.tsx        # Main UI page
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── types/
│   │   └── ipc.d.ts        # Global Electron API types (window.electronAPI)
│   │
│   ├── public/
│   ├── tsconfig.json
│   ├── package.json
│
├── python/
│   ├── tracker.py          # Background activity tracker (apps, windows, time)
│   └── analyzer.py         # Reads SQLite, prepares data for AI
│
├── database/
│   └── worksight.db        # SQLite database (local-only)
│
├── package.json            # Root scripts (electron dev, preload build)
├── .gitignore
└── README.md
```
