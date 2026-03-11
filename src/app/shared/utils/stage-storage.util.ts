export type ScheduleYear = '2025' | '2026';
type StageYear = ScheduleYear;

const STAGE_KEY = 'stage';
const DATA_STAGE_ENABLE_KEY = 'dataStageEnable';
const CURRENT_STAGE_YEAR_KEY = 'currentStageYear';
const DEFAULT_STAGE_YEAR: StageYear = '2025';
const HANDLED_KEYS = new Set([STAGE_KEY, DATA_STAGE_ENABLE_KEY]);

let patchApplied = false;
let baseGetItem: ((key: string) => string | null) | null = null;
let baseSetItem: ((key: string, value: string) => void) | null = null;

export function setupStageStorageBridge(): void {
  if (patchApplied) {
    return;
  }

  const storage = getStorage();
  if (!storage) {
    return;
  }

  baseGetItem = storage.getItem.bind(storage);
  baseSetItem = storage.setItem.bind(storage);

  storage.getItem = (key: string): string | null => {
    if (!shouldHandleKey(key) || !baseGetItem) {
      return baseGetItem ? baseGetItem(key) : null;
    }

    const raw = baseGetItem(key);
    return filterPayloadByYear(raw, getActiveStageYearInternal());
  };

  storage.setItem = (key: string, value: string): void => {
    if (!shouldHandleKey(key) || !baseGetItem || !baseSetItem) {
      baseSetItem?.(key, value);
      return;
    }

    const mergedValue = mergePayloadForYear(baseGetItem(key), value, getActiveStageYearInternal());
    baseSetItem(key, mergedValue);
  };

  if (!baseGetItem(CURRENT_STAGE_YEAR_KEY)) {
    baseSetItem(CURRENT_STAGE_YEAR_KEY, DEFAULT_STAGE_YEAR);
  }

  patchApplied = true;
}

export function getActiveStageYear(): StageYear {
  return getActiveStageYearInternal();
}

export function setActiveStageYear(year: StageYear): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(CURRENT_STAGE_YEAR_KEY, year);
}

function getActiveStageYearInternal(): StageYear {
  const storage = getStorage();
  if (!storage) {
    return DEFAULT_STAGE_YEAR;
  }

  const stored = storage.getItem(CURRENT_STAGE_YEAR_KEY);
  return stored === '2026' ? '2026' : DEFAULT_STAGE_YEAR;
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage;
}

function shouldHandleKey(key: string): boolean {
  return HANDLED_KEYS.has(key);
}

function filterPayloadByYear(raw: string | null, year: StageYear): string | null {
  const payload = parsePayload(raw);
  if (!payload) {
    return raw;
  }

  const target = payload[year];
  if (!target || !target.length) {
    return null;
  }

  return JSON.stringify(target);
}

function mergePayloadForYear(existingRaw: string | null, incomingRaw: string, year: StageYear): string {
  const incoming = parseArray(incomingRaw);
  if (!incoming) {
    return incomingRaw;
  }

  const payload = parsePayload(existingRaw) ?? createEmptyPayload();
  payload[year] = incoming.map((entry) => normalizeEntry(entry, year));
  return JSON.stringify(payload);
}

function parsePayload(raw: string | null): Record<StageYear, any[]> | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return {
        '2025': parsed,
        '2026': [],
      };
    }

    if (typeof parsed === 'object' && parsed !== null) {
      const payload = createEmptyPayload();
      (['2025', '2026'] as StageYear[]).forEach((year) => {
        const value = (parsed as Record<string, any>)[year];
        if (Array.isArray(value)) {
          payload[year] = value;
        }
      });
      return payload;
    }
  } catch {
    return null;
  }

  return null;
}

function parseArray(value?: string | null): any[] | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function createEmptyPayload(): Record<StageYear, any[]> {
  return {
    '2025': [],
    '2026': [],
  };
}

function normalizeEntry(entry: any, year: StageYear): any {
  if (entry && typeof entry === 'object') {
    return {
      ...entry,
      YEAR: year,
      year,
    };
  }

  return entry;
}
