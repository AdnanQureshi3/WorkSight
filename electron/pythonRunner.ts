import { spawn } from "child_process";
import path from "path";

export function runPythonAI(payload: any[]) {
  return new Promise((resolve, reject) => {
    const parentDir = path.resolve(__dirname, "..");
    const pythonPath = path.join(
        parentDir,
        "../python/venv/Scripts/python.exe"
      );
      const scriptPath = path.join(parentDir, "../python/ai_worker.py");
    

    const py = spawn(pythonPath, [scriptPath], {
      windowsHide: true,
    });


    let stdout = "";
    let stderr = "";

    // Read stdout (JSON RESULT)
    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    // Read stderr (LOGS ONLY)
    py.stderr.on("data", (data) => {
      stderr += data.toString();
      console.log("PY LOG:", data.toString());
    });

    // When Python finishes
    py.on("close", (code) => {
      if (code !== 0) {
        return reject(`Python exited with code ${code}`);
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (err) {
        reject("Failed to parse Python JSON output:\n" + stdout);
      }
    });

    // Send data to Python
    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });
}
