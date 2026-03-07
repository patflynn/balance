import React, { useState } from "react";
import { Menu, Bell, Plus, Activity, Utensils } from "lucide-react";
import { useAppStore } from "./store";
import { MetricSlider } from "./components/MetricSlider";
import { FoodLogger } from "./components/FoodLogger";

export function App() {
  const { metrics, logs, foodLogs, addLog, addFoodLog, addMetric } =
    useAppStore();
  const [activeTab, setActiveTab] = useState<"metrics" | "food">("metrics");
  const [showAdd, setShowAdd] = useState(false);

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

  return (
    <div className="min-h-screen bg-sage flex justify-center items-center p-4 sm:p-8">
      <div className="w-full max-w-[390px] h-[844px] bg-sage rounded-[3rem] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_8px_rgba(0,0,0,0.05)] flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center pt-12 px-8 pb-6 shrink-0">
          <Menu className="w-6 h-6 text-forest" strokeWidth={1.5} />
          <h1 className="text-sm tracking-[0.2em] font-medium uppercase text-forest">
            Balance
          </h1>
          <Bell className="w-6 h-6 text-forest" strokeWidth={1.5} />
        </header>

        {/* Tabs */}
        <div className="px-6 mb-4 flex gap-4 shrink-0">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`flex-1 py-3 rounded-2xl text-xs tracking-[0.1em] uppercase font-medium border-none cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 ${activeTab === "metrics" ? "bg-forest text-sage" : "bg-sand text-forest"}`}
          >
            <Activity className="w-4 h-4" />
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("food")}
            className={`flex-1 py-3 rounded-2xl text-xs tracking-[0.1em] uppercase font-medium border-none cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 ${activeTab === "food" ? "bg-forest text-sage" : "bg-sand text-forest"}`}
          >
            <Utensils className="w-4 h-4" />
            Food
          </button>
        </div>

        {/* Content */}
        <div className="px-6 flex flex-col gap-5 flex-1 overflow-y-auto pb-8 scrollbar-none">
          {activeTab === "metrics" && (
            <>
              {metrics.map((metric) => {
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
            </>
          )}

          {activeTab === "food" && (
            <>
              <FoodLogger onLog={addFoodLog} />

              <div className="flex flex-col gap-4 mt-2">
                <h3 className="text-[10px] tracking-[0.15em] uppercase text-forest font-medium px-2">
                  Recent Meals
                </h3>
                {foodLogs.length === 0 && (
                  <p className="text-xs text-mint px-2">
                    No meals logged yet today.
                  </p>
                )}
                {foodLogs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-cream rounded-[2rem] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex gap-4 items-center"
                  >
                    <img
                      src={log.imageUrl}
                      alt="Meal"
                      className="w-20 h-20 object-cover rounded-2xl"
                    />
                    <div className="flex-1 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-forest">
                          {log.calories} kcal
                        </span>
                        <span className="text-[9px] uppercase tracking-[0.05em] text-mint">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="px-2 py-1 bg-sand rounded-md text-[9px] uppercase tracking-[0.05em] text-forest">
                          Carb: {log.carb}
                        </span>
                        <span className="px-2 py-1 bg-sand rounded-md text-[9px] uppercase tracking-[0.05em] text-forest">
                          Meat: {log.meat}
                        </span>
                        {log.dairy && (
                          <span className="px-2 py-1 bg-sand rounded-md text-[9px] uppercase tracking-[0.05em] text-forest">
                            Dairy
                          </span>
                        )}
                        {log.gluten && (
                          <span className="px-2 py-1 bg-sand rounded-md text-[9px] uppercase tracking-[0.05em] text-forest">
                            Gluten
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
