import { useState, useEffect } from "react";
import { Metric, LogEntry, FoodLogEntry } from "./types";

export const DEFAULT_METRICS: Metric[] = [
  { id: "m1", name: "Mood", leftLabel: "Sad", rightLabel: "Happy", steps: 5 },
  {
    id: "m2",
    name: "Stress",
    leftLabel: "Low",
    rightLabel: "High",
    steps: 5,
  },
  {
    id: "m3",
    name: "Tension",
    leftLabel: "Low",
    rightLabel: "High",
    steps: 5,
  },
  {
    id: "m4",
    name: "Anger",
    leftLabel: "Low",
    rightLabel: "High",
    steps: 5,
  },
  {
    id: "m5",
    name: "Brain Fog",
    leftLabel: "Clear",
    rightLabel: "Dense",
    steps: 5,
  },
  {
    id: "m6",
    name: "Headache",
    leftLabel: "None",
    rightLabel: "Severe",
    steps: 5,
  },
  {
    id: "m7",
    name: "Energy",
    leftLabel: "Exhausted",
    rightLabel: "Energized",
    steps: 5,
  },
  {
    id: "m8",
    name: "Sleepiness",
    leftLabel: "Awake",
    rightLabel: "Sleepy",
    steps: 5,
  },
  {
    id: "m9",
    name: "Water (Cups)",
    leftLabel: "0",
    rightLabel: "8+",
    steps: 5,
  },
  {
    id: "m10",
    name: "Alcohol (Units)",
    leftLabel: "0",
    rightLabel: "4+",
    steps: 5,
  },
];

export function useAppStore() {
  const [metrics, setMetrics] = useState<Metric[]>(() => {
    const saved = localStorage.getItem("metrics");
    return saved ? JSON.parse(saved) : DEFAULT_METRICS;
  });
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const saved = localStorage.getItem("logs");
    return saved ? JSON.parse(saved) : [];
  });
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>(() => {
    const saved = localStorage.getItem("foodLogs");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("metrics", JSON.stringify(metrics));
  }, [metrics]);
  useEffect(() => {
    localStorage.setItem("logs", JSON.stringify(logs));
  }, [logs]);
  useEffect(() => {
    localStorage.setItem("foodLogs", JSON.stringify(foodLogs));
  }, [foodLogs]);

  const addLog = (metricId: string, value: number) => {
    setLogs((prev) => [
      {
        id: Date.now().toString(),
        metricId,
        value,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const addFoodLog = (foodData: Omit<FoodLogEntry, "id" | "timestamp">) => {
    setFoodLogs((prev) => [
      { id: Date.now().toString(), timestamp: Date.now(), ...foodData },
      ...prev,
    ]);
  };

  const addMetric = (metric: Omit<Metric, "id">) => {
    setMetrics((prev) => [
      ...prev,
      { id: Date.now().toString(), ...metric },
    ]);
  };

  return { metrics, logs, foodLogs, addLog, addFoodLog, addMetric };
}
