import { spawn } from "child_process";

export function runPythonAI(payload: any) {
    console.log("Running Python AI with payload:", payload);
  return new Promise<any>((resolve, reject) => {
    const py = spawn("python", ["python/ai_worker.py"]);

    let output = "";
    let error = "";

    py.stdout.on("data", (d) => (output += d.toString()));
    py.stderr.on("data", (d) => (error += d.toString()));

    py.on("close", () => {
      if (error) return reject(error);
      try {
        resolve(JSON.parse(output));
      } catch (e) {
        reject(new Error("Invalid JSON returned from python: " + output));
      }
    });

    py.stdin.write(JSON.stringify(payload));
    py.stdin.end();
  });
}
