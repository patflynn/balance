import { useState, useEffect, useCallback } from "react";
import { openDB, IDBPDatabase } from "idb";
import { Metric, LogEntry } from "./types";

const DB_NAME = "balance";
const DB_VERSION = 1;

export const DEFAULT_METRICS: Metric[] = [
  {
    id: "m1",
    name: "Mood",
    leftLabel: "Sad",
    rightLabel: "Happy",
    steps: 5,
    order: 0,
    enabled: true,
  },
  {
    id: "m2",
    name: "Stress",
    leftLabel: "Low",
    rightLabel: "High",
    steps: 5,
    order: 1,
    enabled: true,
  },
  {
    id: "m3",
    name: "Energy",
    leftLabel: "Exhausted",
    rightLabel: "Energized",
    steps: 5,
    order: 2,
    enabled: true,
  },
  {
    id: "m4",
    name: "Anxiety",
    leftLabel: "Calm",
    rightLabel: "Anxious",
    steps: 5,
    order: 3,
    enabled: true,
  },
  {
    id: "m5",
    name: "Fatigue",
    leftLabel: "Rested",
    rightLabel: "Fatigued",
    steps: 5,
    order: 4,
    enabled: true,
  },
  {
    id: "m6",
    name: "Tension",
    leftLabel: "Low",
    rightLabel: "High",
    steps: 5,
    order: 5,
    enabled: true,
  },
  {
    id: "m7",
    name: "Headache",
    leftLabel: "None",
    rightLabel: "Severe",
    steps: 5,
    order: 6,
    enabled: true,
  },
  {
    id: "m8",
    name: "Brain Fog",
    leftLabel: "Clear",
    rightLabel: "Dense",
    steps: 5,
    order: 7,
    enabled: true,
  },
  {
    id: "m9",
    name: "Sleepiness",
    leftLabel: "Awake",
    rightLabel: "Sleepy",
    steps: 5,
    order: 8,
    enabled: true,
  },
  {
    id: "m10",
    name: "Water (Cups)",
    leftLabel: "0",
    rightLabel: "8+",
    steps: 5,
    order: 9,
    enabled: true,
  },
  {
    id: "m11",
    name: "Alcohol (Units)",
    leftLabel: "0",
    rightLabel: "4+",
    steps: 5,
    order: 10,
    enabled: true,
  },
  {
    id: "m12",
    name: "Caffeine (Cups)",
    leftLabel: "0",
    rightLabel: "5+",
    steps: 5,
    order: 11,
    enabled: true,
  },
];

async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("metrics")) {
        db.createObjectStore("metrics", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("logs")) {
        const logStore = db.createObjectStore("logs", { keyPath: "id" });
        logStore.createIndex("metricId", "metricId");
        logStore.createIndex("timestamp", "timestamp");
      }
    },
  });
}

export function useAppStore() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;
    async function load() {
      const db = await getDb();
      let storedMetrics = await db.getAll("metrics");
      if (storedMetrics.length === 0) {
        const tx = db.transaction("metrics", "readwrite");
        for (const m of DEFAULT_METRICS) {
          await tx.store.put(m);
        }
        await tx.done;
        storedMetrics = DEFAULT_METRICS;
      }
      const storedLogs: LogEntry[] = await db.getAll("logs");
      if (!cancelled) {
        setMetrics(
          (storedMetrics as Metric[]).sort((a, b) => a.order - b.order),
        );
        setLogs(storedLogs.sort((a, b) => b.timestamp - a.timestamp));
        setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const addLog = useCallback((metricId: string, value: number) => {
    const entry: LogEntry = {
      id: Date.now().toString(),
      metricId,
      value,
      timestamp: Date.now(),
      synced: false,
    };
    setLogs((prev) => [entry, ...prev]);
    getDb().then((db) => db.put("logs", entry));
  }, []);

  const addMetric = useCallback(
    (metric: Omit<Metric, "id" | "order" | "enabled">) => {
      const newMetric: Metric = {
        id: Date.now().toString(),
        ...metric,
        order: metrics.length,
        enabled: true,
      };
      setMetrics((prev) => [...prev, newMetric]);
      getDb().then((db) => db.put("metrics", newMetric));
    },
    [metrics.length],
  );

  return { metrics, logs, addLog, addMetric, loaded };
}
