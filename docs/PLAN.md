# Balance — Product & Architecture Plan

## Context

Balance (formerly Measure) is a personal health/mood tracking app. There's a working prototype with metric sliders, food logging (mock), and localStorage persistence. The rename just landed (PR #12). Now we need to think through the product holistically before building further: what it does, how it works, and how to make it something you actually use every day.

Core constraint: **usability must be delightful and quick.** A tracking app that doesn't get used is useless.

---

## Product Design

### What Balance Does

Balance is a personal measurement tool. It probes the user at scheduled times throughout the day and records how they're doing across a set of health/wellness metrics. The user only interacts with metrics that are noteworthy — if you feel baseline, you skip it, and the absence of data is itself informative.

### Interaction Model

- **Tap to record**: Tapping a value on a metric slider immediately records it with a timestamp. No confirmation, no save button.
- **Skip to not record**: If you don't touch a metric, nothing is recorded. Future analysis can assume defaults for missing data.
- **No "Record All" button**: Each metric is independent. Open the app, tap the 1-2 things that are off, close the app. 5 seconds.

### Metrics

- **Opinionated defaults**: Ships with curated metrics (Mood, Stress, Energy, Anxiety, Fatigue, Tension, Headache, Brain Fog, Sleepiness, Water, Alcohol).
- **Customizable**: Users can add/remove/reorder metrics with custom labels.
- **1-5 scale** with left/right labels (e.g., Stress: Low → High).
- **Per-metric schedule**: Each metric has a configurable notification schedule (e.g., stress at 9am/1pm/6pm). If no schedule is set, it's tracked once daily with no notification.

### Scheduled Notifications (PWA)

> **Android-only for now.** iOS PWA limitations (no background sync, no local scheduled notifications) make this impractical on iOS currently. Revisit when Apple improves PWA support.

The app should proactively measure the user rather than waiting for them to remember:

- **Configurable schedule per metric**: e.g., stress at 9am/1pm/6pm, mood at 9pm.
- **Push notifications** via Service Worker + Web Push API.
- **Quick-response from notification**: Notification shows the metric name with action buttons (e.g., "Stress?" → [Low] [Med] [High]) mapping to scale ranges. User can respond without opening the app.
- **Tap notification to open app** for a full check-in when multiple metrics are due.
- **PWA requirement**: App must be installable (manifest.json, service worker) for notifications to work.

### Food Logging (Deferred)

- Food logging requires AI image analysis to be useful (user won't do manual entry).
- AI analysis requires a backend + API key management + auth.
- **Capture the need in the data model** (keep the FoodLogEntry type) but **remove the food tab from the UI for now**.
- Revisit when backend infrastructure exists.

---

## Data Architecture

### Data Model

```typescript
interface Metric {
  id: string;
  name: string;
  leftLabel: string;
  rightLabel: string;
  steps: number;           // default 5
  schedule?: string[];     // notification times ["09:00", "13:00", "18:00"]
                           // if empty/undefined, tracked once daily with no notification
  order: number;           // display order
  enabled: boolean;        // user can disable without deleting
}

interface LogEntry {
  id: string;
  metricId: string;
  value: number;           // 0 to steps-1
  timestamp: number;       // ms since epoch
  synced: boolean;         // has this been synced to remote?
}

// Deferred — kept in types but not in UI
interface FoodLogEntry { ... }
```

### Local Storage

- **IndexedDB** (via a thin wrapper or idb library) instead of localStorage.
  - localStorage is synchronous and limited to ~5MB.
  - IndexedDB supports structured queries, larger storage, and works in Service Workers.
- Data remains offline-first: the app works fully without any network.

### Sync — Google Sheets (First Backend)

**Why Google Sheets first**: Zero infrastructure for the user. They already have a Google account. A spreadsheet is human-readable, exportable, and the user literally owns the file.

**How it works**:
1. User authenticates with Google OAuth (client-side flow, no backend needed).
2. App creates a Balance spreadsheet (or connects to an existing one).
3. Two sheets in the spreadsheet:
   - **Logs** sheet — columns: `timestamp`, `metricId`, `metricName`, `value`, `synced`. All entries in one flat table.
   - **Metrics** sheet — stores metric definitions (id, name, labels, scale, schedule, etc.). Keeps configs synced across devices.
4. Sync is incremental: track `synced` flag on LogEntry, push unsynced entries on sync.
5. Sync happens on app open, after recording, and periodically in background (Service Worker).

**Why a single Logs sheet** instead of a tab per metric: simpler schema, scales to any number of metrics without sheet proliferation, and makes cross-metric analysis (filtering, pivoting, charting) easy in the spreadsheet itself.

**Sync abstraction layer** — design a simple interface so backends are swappable:

```typescript
interface SyncBackend {
  connect(): Promise<void>;
  pushEntries(entries: LogEntry[]): Promise<void>;
  pullEntries(since: number): Promise<LogEntry[]>;
  pushMetrics(metrics: Metric[]): Promise<void>;
  pullMetrics(since: number): Promise<Metric[]>;
  disconnect(): Promise<void>;
}
```

The interface syncs both log entries and metric definitions, so metric configs (names, labels, schedules) stay consistent across devices. Google Sheets is the first implementation. CouchDB and remoteStorage are future implementations of the same interface.

### Future Open Backend (Not Built Now)

Research identified **PouchDB/CouchDB** as the best open, self-hostable option and **remoteStorage** as the purist option. These would be additional `SyncBackend` implementations added later.

---

## Technical Architecture

### PWA Setup

- `manifest.json` — app name, icons, theme color, display: standalone
- Service Worker — caching (offline), push notifications, background sync
- HTTPS required (GitHub Pages provides this)

### Notification Flow

```
Schedule fires (Service Worker timer or Push)
  → Show notification with metric name + action buttons
  → User taps action button
    → Service Worker records LogEntry to IndexedDB
    → No app open needed
  → OR User taps notification body
    → App opens to check-in screen with due metrics
```

Web Push notification actions support 2-3 buttons on most platforms. For a 5-point scale, map to 3 buttons: Low (1-2), Mid (3), High (4-5). This is a good-enough approximation for quick input.

### Project Structure Changes

```
balance/
├── client/
│   ├── src/
│   │   ├── App.tsx              # Main UI (metrics tab only for now)
│   │   ├── main.tsx
│   │   ├── store.ts             # Migrate to IndexedDB
│   │   ├── types.ts             # Updated data model
│   │   ├── components/
│   │   │   └── MetricSlider.tsx  # Keep, enhance
│   │   ├── sync/
│   │   │   ├── interface.ts     # SyncBackend interface
│   │   │   └── google-sheets.ts # Google Sheets implementation
│   │   └── sw.ts                # Service Worker
│   ├── manifest.json            # PWA manifest
│   └── ...
├── server/                      # Keep for future backend needs
└── ...
```

---

## Implementation Phases

### Phase 1: Foundation
- Migrate from localStorage to IndexedDB
- Update data model (add schedule, order, enabled, synced to metrics/entries)
- Remove food tab from UI (keep types for future)
- Update CLAUDE.md with new conventions and UX principles (delightful, quick)
- Add "usability must be delightful and quick" as a top-level project principle

### Phase 2: PWA + Notifications
- Add manifest.json and service worker
- Implement installable PWA
- Add scheduled notifications with quick-response action buttons
- Per-metric notification schedule configuration

### Phase 3: Google Sheets Sync
- Define SyncBackend interface
- Implement Google OAuth client-side flow
- Implement Google Sheets sync backend
- Incremental sync with synced flag
- Settings UI for connecting/disconnecting Google account

### Phase 4: Polish
- Metric reordering / customization UI
- Historical data view (simple timeline)
- Refine notification UX based on real usage

### Future
- CouchDB sync backend
- remoteStorage sync backend
- Food logging with AI (requires backend)

---

## Verification

Each phase should be verified by:
- `npm run lint` and `npm run build` pass
- Manual testing on mobile (Chrome DevTools device mode + real device)
- PWA installability check (Lighthouse audit) for Phase 2
- End-to-end sync test with a real Google Sheet for Phase 3
- Integration tests for sync interface implementations
