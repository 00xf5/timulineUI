# Client-Side Development Guide: RiskSignal Timeline

> **Status:** Definitive Source of Truth  
> **Version:** 1.0.0  
> **Target:** Vercel / Next.js Consumption  
> **Backend:** Render Drift Engine (`https://drift-whvl.onrender.com`)

---

## 0. Approved Tech Stack (Dependencies)

To achieve the "Premium/Dense" feel, use this exact stack. Do not deviate.

*   **Framework:** Next.js 14+ (App Router, TypeScript)
*   **Styling:** Tailwind CSS (for utility speed)
*   **Icons:** `lucide-react` (Standard, crisp, clean)
*   **Animations:** `framer-motion` (Subtle layout shifts, no bouncy nonsense)
*   **State:** `zustand` (Clean global filters)
*   **Dates:** `date-fns` (Forensic precision formatting)
*   **Fonts:** 
    *   **Sans:** `Inter` or `Geist Sans` (UI)
    *   **Mono:** `JetBrains Mono` or `Geist Mono` (Diffs/Code)
*   **Optional:** `shadcn/ui` (for base accessible primitives like Tooltips/Dialogs)

---

## 1. Design & Philosophy ("The Feel")

**Core Mandate:** This is **NOT** a social feed. It is a **Forensic History Tool**.
Users are scrubbing through time to find the exact moment an exploit became possible.

### Visual Identity
*   **Vibe:** Datadog / Grafana / GitHub Security. Serious, dense, trustworthy.
*   **Anti-Patterns:** ❌ No neon, no childish animations, no "casino" gradients.
*   **Palette:**
    *   **Background:** Deep Charcoal / Near-Black (e.g., `#0f0f10`)
    *   **Panels:** Soft Gray (e.g., `#1a1a1c`)
    *   **Text:** High legibility white/gray.
    *   **Accents:** 
        *   🔴 **Critical:** Red / Rose
        *   🟠 **Risk:** Amber / Orange
        *   🟢 **Stable/Resolved:** Muted Green
        *   ⚪ **Noise:** Gray

### Layout Mental Model
*   **Left Hand:** Controls & Filters (Severity, Asset Type, Date Range).
*   **Right Hand:** The Story (Vertical Timeline Spine).
*   **Interaction:** 
    *   Events start **collapsed** (high density).
    *   Click to **expand** (forensic detail).
    *   Keyboard navigation (`j`/`k` or `↑`/`↓`) is a "nice to have".

---

## 2. Project Structure (Next.js App Router)

Standardized Vercel deployment structure.

```text
/src
  /app
    /timeline
      /[domain]
        page.tsx        # Server Component (Initial Fetch)
        client.tsx      # Client Wrapper (State Init)
        loading.tsx     # Skeleton Loaders
        error.tsx       # Graceful Degradation
  
  /components
    /timeline
      TimelineContainer.tsx     # Logic/Layout orchestrator
      TimelineFeed.tsx          # Virtualized List (if many events)
      DriftEventNode.tsx        # The individual row/card
      FiltersPanel.tsx          # Sidebar controls
      DiffViewer.tsx            # Monaco-lite or simple text diff
      SeverityBadge.tsx         # Standardized Pill
  
  /lib
    api.ts              # Typed fetch wrappers
    types.ts            # Shared Interfaces (See Section 3)
    utils.ts            # Date formatting, color helpers
  
  /store
    useTimelineStore.ts # Zustand State (Filters, Active Event)
```

---

## 3. Strict Data Types (TypeScript)

Copy/Paste these definitions into `src/lib/types.ts`. **Do not deviate.**

### Enums & Unions
```typescript
export type Severity = 'critical' | 'risk' | 'noise';

export type AssetType = 
  | 'js' 
  | 'api' 
  | 'infrastructure' 
  | 'service' 
  | 'secret' 
  | 'unknown';

export type ChangeType = 
  | 'asset_added' 
  | 'asset_modified' 
  | 'asset_removed' 
  | 'endpoint_added' 
  | 'endpoint_modified'
  | 'secret_detected'
  | 'service_change';
```

### Core Entities
```typescript
/**
 * Represents a single point in time change.
 * Returned by /api/drift/timeline and /api/drift/event/:id
 */
export interface TimelineEvent {
  id: string;               // Mongo ObjectId
  timestamp: string;        // ISO 8601
  severity: Severity;
  type: ChangeType;         // mapped from backend 'type' + 'action'
  asset_type: AssetType;
  
  // Display
  summary: string;          // Short title (e.g. "New API Endpoint Detected")
  path: string;             // The subject (e.g. "/api/v1/auth", "main.js")
  
  // Forensics
  impact: string;           // "New attack surface exposed..."
  confidence: number;       // 0.0 to 1.0
  security_implication?: string; 
  
  // Data for DiffViewer
  diff?: {
    before: any | null;     // JSON or String content
    after: any | null;
  };
  
  // Metadata associated with the event
  details?: Record<string, any>;
}
```

### Response Shifts
```typescript
export interface TimelineResponse {
  events: TimelineEvent[];
  next_cursor: string | null;  // Pagination cursor
  total_returned: number;
}

export interface AssetChangeStats {
  path: string;
  count: number;
  last_change: string; // ISO Date
  severity: Severity;
  type: AssetType;
}

export interface DriftStatsResponse {
  total_drifts: number;
  critical_count: number;
  risk_count: number;
  time_range_days: number;
  
  by_asset_type: {
    js: number;
    api: number;
    infrastructure: number;
    service: number;
    secret: number;
  };

  most_changed_assets: AssetChangeStats[];
}

export interface AssetHistoryResponse {
  asset_path: string;
  time_range_days: number;
  summary: {
    total_changes: number;
    critical_changes: number;
    risk_changes: number;
    first_seen: string | null;
    last_seen: string | null;
    most_common_action: string | null;
  };
  history: TimelineEvent[]; // Full event objects for this specific asset
}
```

---

## 4. API Integration Layer

Use `src/lib/api.ts`.

**Configuration:**
*   **Base URL:** `https://drift-whvl.onrender.com`
*   **Auth:** Header `x-api-key` (Sourced from env `NEXT_PUBLIC_DRIFT_API_KEY`)

```typescript
const BASE_URL = 'https://drift-whvl.onrender.com';

async function fetchInternal<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
  // 1. Clean params (remove undefined/null)
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) query.append(key, String(value));
  });

  // 2. Fetch
  const res = await fetch(`${BASE_URL}${endpoint}?${query.toString()}`, {
    headers: {
      'x-api-key': process.env.NEXT_PUBLIC_DRIFT_API_KEY || '',
      'Content-Type': 'application/json'
    },
    next: { revalidate: 60 } // Cache for 60s (Next.js specific)
  });

  if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
  return res.json();
}

// --- Specific Methods ---

export const getTimeline = (domain: string, filters: {
  severity?: Severity;
  asset_type?: AssetType;
  from?: string;
  to?: string;
  cursor?: string;
}) => fetchInternal<TimelineResponse>('/api/drift/timeline', { domain, ...filters });

export const getStats = (domain: string, days: number = 30) => 
  fetchInternal<DriftStatsResponse>('/api/drift/stats', { domain, days });

export const getAssetHistory = (domain: string, path: string, days: number = 30) =>
  fetchInternal<AssetHistoryResponse>('/api/drift/asset-history', { domain, path, days });
```

---

## 5. State Management (Zustand)

Location: `src/store/useTimelineStore.ts`

Does not need to store *data* (use React Query or SWR for that), but should store *filters and UI state*.

```typescript
import { create } from 'zustand';
import { Severity, AssetType } from '@/lib/types';

interface TimelineState {
  // Filters
  selectedSeverity: Severity | null; // null = all
  selectedAssetType: AssetType | null;
  dateRange: { from: Date | null; to: Date | null };
  
  // UI State
  expandedEventId: string | null; // Only one expanded at a time? Or multiple?
  
  // Actions
  setSeverity: (lev: Severity | null) => void;
  setAssetType: (type: AssetType | null) => void;
  setDateRange: (range: { from: Date | null; to: Date | null }) => void;
  toggleEvent: (id: string) => void;
}

export const useTimelineStore = create<TimelineState>((set) => ({
  selectedSeverity: null,
  selectedAssetType: null,
  dateRange: { from: null, to: null },
  expandedEventId: null,

  setSeverity: (lev) => set({ selectedSeverity: lev }),
  setAssetType: (type) => set({ selectedAssetType: type }),
  setDateRange: (range) => set({ dateRange: range }),
  toggleEvent: (id) => set((state) => ({ 
    expandedEventId: state.expandedEventId === id ? null : id 
  })),
}));
```

---

## 6. Component Implementations

### `<TimelineContainer />`
*   **Role:** Orchestrator.
*   **Props:** `domain: string`
*   **Behavior:**
    1.  Fetches `Stats` first to populate the header (Total Drifts, Critical Count).
    2.  Fetches `Timeline` based on Store filters.
    3.  Renders `<FiltersPanel>` (Left) and `<TimelineFeed>` (Right).

### `<DriftEventNode />`
*   **Role:** The row item.
*   **Props:** `event: TimelineEvent`
*   **Visual States:**
    *   **Collapsed:**
        *   Severity Badge (Left)
        *   Timeline Line (Center - continuous vertical line)
        *   Summary + Timestamp (Right)
    *   **Expanded:**
        *   Shows `impact` (Why it matters).
        *   Shows `path` (clickable -> goes to Asset History).
        *   Shows `<DiffViewer>` (Before vs After code/json).
        *   Shows `confidence` score.

### `<DiffViewer />`
*   **Role:** Show what actually changed.
*   **Logic:**
    *   If `diff.before` and `diff.after` are text/code -> Render Side-by-Side text diff.
    *   If `diff` is JSON -> Render JSON Tree Diff.
    *   If `diff.before` is null (New Asset) -> Show Green background code block.
    *   If `diff.after` is null (Deleted Asset) -> Show Red background code block.
*   **Styling:** Monospace font (JetBrains Mono / Fira Code).

### `<AssetHistoryView />` (Modal or Separate Page)
*   **Trigger:** User clicks on a filename (e.g., `main.js`) in a Drift Event.
*   **Fetches:** `getAssetHistory(domain, path)`.
*   **Renders:** A tailored mini-timeline showing *only* changes for that specific file over 30 days. Perfect for answering: *"Who broke this file and when?"*

---

## 7. Webhook & Real-time Info

While the client is mostly "Pull" based, be aware of the backend trigger.

*   **Endpoint:** `POST /webhook/scan-complete`
*   **Flow:** 
    1.  Core Engine finishes scan.
    2.  Hits Webhook.
    3.  Drift Engine processes diffs.
    4.  *(Future)* Frontend receives WebSocket/SSE update to toast: "New Scan Completed - Refresh to see 3 new drifts".
