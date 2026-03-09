import React, { useState } from "react";
import { Settings, Plus, RefreshCw, X } from "lucide-react";
import { useAppStore } from "./store";
import { MetricSlider } from "./components/MetricSlider";

export function App() {
  const {
    metrics,
    logs,
    addLog,
    addMetric,
    loaded,
    syncConnected,
    syncing,
    connectSync,
    disconnectSync,
    syncNow,
  } = useAppStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [newMetric, setNewMetric] = useState({
    name: "",
    leftLabel: "",
    rightLabel: "",
    steps: 5,
  });

  const handleAddMetric = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMetric.name) {
      addMetric(newMetric);
      setNewMetric({ name: "", leftLabel: "", rightLabel: "", steps: 5 });
      setShowAdd(false);
    }
  };

  const handleConnect = async () => {
    setSyncError(null);
    try {
      await connectSync();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const handleDisconnect = async () => {
    setSyncError(null);
    await disconnectSync();
  };

  const handleSyncNow = async () => {
    setSyncError(null);
    try {
      await syncNow();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Sync failed");
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-sage flex justify-center items-center">
        <span className="text-sm text-mint tracking-[0.1em] uppercase">
          Loading…
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage flex justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-[390px] h-[844px] bg-sage rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_8px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center pt-12 px-8 pb-6 shrink-0">
          <div className="w-6" />
          <h1
            data-testid="app-header"
            className="text-sm tracking-[0.2em] font-medium uppercase text-forest"
          >
            Balance
          </h1>
          <button
            data-testid="settings-button"
            onClick={() => setShowSettings(!showSettings)}
            className="bg-transparent border-none cursor-pointer p-0"
          >
            <Settings
              className="w-6 h-6 text-forest"
              strokeWidth={1.5}
            />
          </button>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <div
            data-testid="settings-panel"
            className="mx-6 mb-4 bg-cream rounded-[2rem] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col gap-3 shrink-0"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-[11px] tracking-[0.15em] uppercase text-forest font-medium">
                Settings
              </h2>
              <button
                data-testid="settings-close"
                onClick={() => setShowSettings(false)}
                className="bg-transparent border-none cursor-pointer p-0"
              >
                <X className="w-4 h-4 text-mint" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[10px] tracking-[0.1em] uppercase text-mint font-medium">
                Sync
              </span>
              <span
                data-testid="sync-status"
                className="text-xs text-forest"
              >
                {syncConnected
                  ? "Connected to Google Sheets"
                  : "Not connected"}
              </span>
            </div>

            {syncError && (
              <span
                data-testid="sync-error"
                className="text-xs text-red-500"
              >
                {syncError}
              </span>
            )}

            <div className="flex gap-2">
              {syncConnected ? (
                <>
                  <button
                    data-testid="sync-now-button"
                    onClick={handleSyncNow}
                    disabled={syncing}
                    className="flex-1 px-3 py-2 bg-forest text-sage rounded-xl text-xs uppercase tracking-[0.05em] font-medium border-none cursor-pointer font-[inherit] flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`}
                    />
                    {syncing ? "Syncing…" : "Sync Now"}
                  </button>
                  <button
                    data-testid="disconnect-button"
                    onClick={handleDisconnect}
                    className="px-3 py-2 text-xs uppercase tracking-[0.05em] text-mint font-medium bg-transparent border border-mint rounded-xl cursor-pointer font-[inherit]"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  data-testid="connect-google-button"
                  onClick={handleConnect}
                  className="w-full px-3 py-2 bg-forest text-sage rounded-xl text-xs uppercase tracking-[0.05em] font-medium border-none cursor-pointer font-[inherit]"
                >
                  Connect Google Sheets
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 flex flex-col gap-5 flex-1 overflow-y-auto pb-8 scrollbar-none">
          {metrics
            .filter((m) => m.enabled)
            .map((metric) => {
              const today = new Date().setHours(0, 0, 0, 0);
              const latestLog = logs.find(
                (l) => l.metricId === metric.id && l.timestamp > today,
              );

              return (
                <MetricSlider
                  key={metric.id}
                  metric={metric}
                  currentValue={latestLog?.value}
                  onLog={(val) => addLog(metric.id, val)}
                />
              );
            })}

          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="w-full p-4 border-2 border-dashed border-mint rounded-[2rem] text-forest text-xs tracking-[0.1em] uppercase font-medium flex items-center justify-center gap-2 bg-transparent cursor-pointer transition-colors duration-200 hover:bg-mint/10"
            >
              <Plus className="w-4 h-4" /> Add Custom Metric
            </button>
          ) : (
            <form
              onSubmit={handleAddMetric}
              className="bg-cream rounded-[2rem] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.05)] flex flex-col gap-3"
            >
              <h3 className="text-[10px] tracking-[0.15em] uppercase text-forest font-medium mb-2">
                New Metric
              </h3>
              <input
                type="text"
                placeholder="Metric Name (e.g. Focus)"
                required
                className="bg-sand rounded-xl px-4 py-2 text-sm text-forest outline-none border-none w-full font-[inherit] placeholder:text-mint"
                value={newMetric.name}
                onChange={(e) =>
                  setNewMetric({ ...newMetric, name: e.target.value })
                }
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Left Label (e.g. Low)"
                  required
                  className="bg-sand rounded-xl px-4 py-2 text-sm text-forest outline-none border-none w-full font-[inherit] placeholder:text-mint"
                  value={newMetric.leftLabel}
                  onChange={(e) =>
                    setNewMetric({
                      ...newMetric,
                      leftLabel: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Right Label (e.g. High)"
                  required
                  className="bg-sand rounded-xl px-4 py-2 text-sm text-forest outline-none border-none w-full font-[inherit] placeholder:text-mint"
                  value={newMetric.rightLabel}
                  onChange={(e) =>
                    setNewMetric({
                      ...newMetric,
                      rightLabel: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 text-xs uppercase tracking-[0.05em] text-mint font-medium bg-transparent border-none cursor-pointer font-[inherit]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest text-sage rounded-xl text-xs uppercase tracking-[0.05em] font-medium border-none cursor-pointer font-[inherit]"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
