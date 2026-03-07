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
    <div className="app-wrapper">
      <div className="phone-frame">
        {/* Header */}
        <header className="app-header">
          <Menu className="header-icon" />
          <h1 className="header-title">Balance</h1>
          <Bell className="header-icon" />
        </header>

        {/* Tabs */}
        <div className="tabs">
          <button
            onClick={() => setActiveTab("metrics")}
            className={`tab ${activeTab === "metrics" ? "tab-active" : "tab-inactive"}`}
          >
            <Activity className="tab-icon" />
            Metrics
          </button>
          <button
            onClick={() => setActiveTab("food")}
            className={`tab ${activeTab === "food" ? "tab-active" : "tab-inactive"}`}
          >
            <Utensils className="tab-icon" />
            Food
          </button>
        </div>

        {/* Content */}
        <div className="content">
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
                  className="add-metric-button"
                >
                  <Plus className="add-metric-icon" /> Add Custom Metric
                </button>
              ) : (
                <form onSubmit={handleAddMetric} className="add-metric-form">
                  <h3 className="form-title">New Metric</h3>
                  <input
                    type="text"
                    placeholder="Metric Name (e.g. Focus)"
                    required
                    className="form-input"
                    value={newMetric.name}
                    onChange={(e) =>
                      setNewMetric({ ...newMetric, name: e.target.value })
                    }
                  />
                  <div className="form-row">
                    <input
                      type="text"
                      placeholder="Left Label (e.g. Low)"
                      required
                      className="form-input"
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
                      className="form-input"
                      value={newMetric.rightLabel}
                      onChange={(e) =>
                        setNewMetric({
                          ...newMetric,
                          rightLabel: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => setShowAdd(false)}
                      className="btn-cancel"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-save">
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

              <div className="recent-meals">
                <h3 className="section-title">Recent Meals</h3>
                {foodLogs.length === 0 && (
                  <p className="empty-text">No meals logged yet today.</p>
                )}
                {foodLogs.map((log) => (
                  <div key={log.id} className="meal-card">
                    <img
                      src={log.imageUrl}
                      alt="Meal"
                      className="meal-image"
                    />
                    <div className="meal-info">
                      <div className="meal-header">
                        <span className="meal-calories">
                          {log.calories} kcal
                        </span>
                        <span className="meal-time">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="meal-tags">
                        <span className="meal-tag">Carb: {log.carb}</span>
                        <span className="meal-tag">Meat: {log.meat}</span>
                        {log.dairy && <span className="meal-tag">Dairy</span>}
                        {log.gluten && <span className="meal-tag">Gluten</span>}
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
