import { useState, useEffect, useCallback, useRef } from "react";
import { openDB, IDBPDatabase } from "idb";
import { Metric, LogEntry } from "./types";
import { SyncBackend } from "./sync/interface";
import { GoogleSheetsBackend } from "./sync/google-sheets";

const DB_NAME = "balance";
const DB_VERSION = 1;
const SYNC_CONNECTED_KEY = "balance_sync_connected";

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
  const [syncConnected, setSyncConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const syncRef = useRef<SyncBackend | null>(null);

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

  // Try to reconnect sync on load if previously connected
  useEffect(() => {
    if (!loaded) return;
    const wasConnected = localStorage.getItem(SYNC_CONNECTED_KEY) === "true";
    if (wasConnected) {
      const backend = new GoogleSheetsBackend();
      backend
        .connect()
        .then(() => {
          syncRef.current = backend;
          setSyncConnected(true);
        })
        .catch(() => {
          // Can't reconnect silently (OAuth requires user gesture) — clear flag
          localStorage.removeItem(SYNC_CONNECTED_KEY);
        });
    }
  }, [loaded]);

  const addLog = useCallback(
    (metricId: string, value: number) => {
      const entry: LogEntry = {
        id: Date.now().toString(),
        metricId,
        value,
        timestamp: Date.now(),
        synced: false,
      };
      setLogs((prev) => [entry, ...prev]);
      getDb().then((db) => db.put("logs", entry));

      // Push to sync backend if connected
      if (syncRef.current?.isConnected()) {
        syncRef.current.pushEntries([entry]).then(() => {
          entry.synced = true;
          getDb().then((db) => db.put("logs", entry));
        });
      }
    },
    [],
  );

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

  const connectSync = useCallback(async () => {
    const backend = new GoogleSheetsBackend();
    await backend.connect();
    syncRef.current = backend;
    setSyncConnected(true);
    localStorage.setItem(SYNC_CONNECTED_KEY, "true");
  }, []);

  const disconnectSync = useCallback(async () => {
    if (syncRef.current) {
      await syncRef.current.disconnect();
      syncRef.current = null;
    }
    setSyncConnected(false);
    localStorage.removeItem(SYNC_CONNECTED_KEY);
  }, []);

  const syncNow = useCallback(async () => {
    const backend = syncRef.current;
    if (!backend?.isConnected()) return;

    setSyncing(true);
    try {
      // Push unsynced entries
      const db = await getDb();
      const allLogs: LogEntry[] = await db.getAll("logs");
      const unsynced = allLogs.filter((l) => !l.synced);

      if (backend instanceof GoogleSheetsBackend) {
        backend.setMetricsNameMap(metrics);
      }

      if (unsynced.length > 0) {
        await backend.pushEntries(unsynced);
        const tx = db.transaction("logs", "readwrite");
        for (const log of unsynced) {
          await tx.store.put({ ...log, synced: true });
        }
        await tx.done;
        setLogs((prev) =>
          prev.map((l) => (l.synced ? l : { ...l, synced: true })),
        );
      }

      // Push metrics
      await backend.pushMetrics(metrics);

      // Pull new entries
      const latestTimestamp = allLogs.reduce(
        (max, l) => Math.max(max, l.timestamp),
        0,
      );
      const pulled = await backend.pullEntries(latestTimestamp);
      if (pulled.length > 0) {
        const txPull = db.transaction("logs", "readwrite");
        for (const entry of pulled) {
          await txPull.store.put(entry);
        }
        await txPull.done;
        setLogs((prev) =>
          [...prev, ...pulled].sort((a, b) => b.timestamp - a.timestamp),
        );
      }
    } finally {
      setSyncing(false);
    }
  }, [metrics]);

  return {
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
  };
}
