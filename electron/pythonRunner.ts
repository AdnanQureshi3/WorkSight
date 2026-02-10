import { spawn } from "child_process";
import path from "path";
import { app } from "electron";

export function runPythonAI(payload: any) {
  return new Promise<any>((resolve, reject) => {
    const aiExe = app.isPackaged
      ? path.join(process.resourcesPath, "ai-worker.exe")
      : path.join(__dirname, "../../python/dist/ai-worker.exe");

    const py = spawn(aiExe, [], { windowsHide: true });

    let output = "";
    let error = "";

    py.stdout.on("data", (d) => (output += d.toString()));
    py.stderr.on("data", (d) => (error += d.toString()));

    py.on("close", () => {
      if (error) return reject(error);
      try {
        resolve(JSON.parse(output));
      } catch (e) {
        reject(new Error("Invalid JSON returned from AI exe: " + output));
      }
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });
}
