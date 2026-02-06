import React, { useEffect, useState } from "react";
import { Eye, EyeOff, Copy, Pencil, Save } from "lucide-react";

type Model = {
  provider: string;
  model: string;
  api_key?: string;
};

function LLM() {
  const [models, setModels] = useState<Model[]>([]);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    window.electronAPI.getModelSupported().then((list: Model[]) => {
      setModels(list);

      // preload existing keys into local state
      const initial: Record<string, string> = {};
      list.forEach((m) => {
        if (m.api_key) {
          initial[`${m.provider}:${m.model}`] = m.api_key;
        }
      });
      setApiKeys(initial);
    });
  }, []);

  const keyId = (p: string, m: string) => `${p}:${m}`;

  const copyKey = async (key?: string) => {
    if (!key) return;
    await navigator.clipboard.writeText(key);
  };

  return (
    <div className="p-5">
      <h2 className="mb-5 text-xl font-semibold">LLM / API Settings</h2>

      <div className="space-y-4">
        {models.map(({ provider, model }) => {
          const id = keyId(provider, model);
          const isEditing = !!editing[id];
          const isVisible = !!visible[id];
          const value = apiKeys[id] || "";

          return (
            <div
              key={id}
              className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3"
            >
              {/* Provider + Model */}
              <div className="w-44">
                <div className="text-sm font-medium text-slate-200">
                  {provider.toUpperCase()}
                </div>
                <div className="truncate text-xs text-slate-400">{model}</div>
              </div>

              {/* API Key Input */}
              <input
                type={isVisible ? "text" : "password"}
                disabled={!isEditing}
                value={value}
                onChange={(e) =>
                  setApiKeys({ ...apiKeys, [id]: e.target.value })
                }
                placeholder="API key not set"
                className={`flex-1 rounded-md px-3 py-2 text-sm
                  ${
                    isEditing
                      ? "bg-slate-700 text-white"
                      : "bg-slate-900 text-slate-500"
                  }`}
              />

              {/* Show / Hide */}
              <button
                title="Show / Hide"
                onClick={() =>
                  setVisible({ ...visible, [id]: !isVisible })
                }
                className="rounded-md p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>

              {/* Copy */}
              <button
                title="Copy API key"
                onClick={() => copyKey(value)}
                className="rounded-md p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
              >
                <Copy size={16} />
              </button>

              {/* Edit / Save */}
              {!isEditing ? (
                <button
                  title="Edit API key"
                  onClick={() =>
                    setEditing({ ...editing, [id]: true })
                  }
                  className="rounded-md p-2 text-slate-400 hover:bg-slate-700 hover:text-white"
                >
                  <Pencil size={16} />
                </button>
              ) : (
                <button
                  title="Save API key"
                  onClick={() => {
                    window.electronAPI.saveApiKeyForModel(
                      provider,
                      model,
                      value
                    );
                    setEditing({ ...editing, [id]: false });
                  }}
                  className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-500"
                >
                  <Save size={16} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LLM;
