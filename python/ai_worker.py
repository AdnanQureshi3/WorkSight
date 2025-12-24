import sys
import json

def main():
    # Read JSON input from Electron
    raw = sys.stdin.read()

    # Debug log (goes to stderr, NOT stdout)
    # print("PYTHON RECEIVED:", raw, file=sys.stderr)

    if not raw.strip():
        print(json.dumps({
            "status": "error",
            "message": "No input received"
        }))
        return

    data = json.loads(raw)

    # ---- AI processing happens here ----
    # For now, just return basic info
    result = {
        "status": "ok",
        "total_items": len(data),
        "data": data
    }

    # IMPORTANT: stdout must contain ONLY JSON
    print(json.dumps(result))


if __name__ == "__main__":
    main()
