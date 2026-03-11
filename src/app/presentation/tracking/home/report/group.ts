import { Item, PhaseBucket, RawItem } from './types';

export function normalizeRaw(items: RawItem[]): Item[] {
  return (items ?? []).map((item: RawItem) => ({
    NUMERO_DOCUMENTO: item?.NUMERO_DOCUMENTO ?? '',
    CODIGO_LOCAL: item?.CODIGO_LOCAL ?? '',
    FECHA_MODALIDAD: item?.FECHA_MODALIDAD ?? '',
    MODALIDAD: item?.MODALIDAD,
    NOMBRE_IMPLEMENTACION: item?.NOMBRE_IMPLEMENTACION,
    FECHA_IMPLEMENTACION: item?.FECHA_IMPLEMENTACION,
    FASE: Number(item?.FASE ?? 0),
    TAREA: Number(item?.TAREA ?? 0),
    DRE: item?.DRE ?? '',
    UGEL: item?.UGEL ?? '',
    NOMBRE_INSTITUCION: item?.NOMBRE_INSTITUCION ?? '',
    DATOS_JSON: safeParseJsonArray(item?.DATOS_JSON),
  }));
}

function safeParseJsonArray(s?: string): any[] {
  if (!s) return [];
  try {
    const parsed = JSON.parse(s);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function initPhaseBuckets(): PhaseBucket[] {
  const emptyTasks = () => ({
    tarea_1: [], tarea_2: [], tarea_3: [], tarea_4: [], tarea_5: [],
  });
  return [
    { fase: 1, tareas: emptyTasks() },
    { fase: 2, tareas: emptyTasks() },
    { fase: 3, tareas: emptyTasks() },
    { fase: 4, tareas: emptyTasks() },
    { fase: 5, tareas: emptyTasks() },
    { fase: 6, tareas: emptyTasks() },
    { fase: 7, tareas: emptyTasks() },
    { fase: 8, tareas: emptyTasks() },
    { fase: 9, tareas: emptyTasks() },
    { fase: 10, tareas: emptyTasks() },
  ];
}

export function groupByPhaseTask(items: Item[]): PhaseBucket[] {
  const buckets = initPhaseBuckets();
  for (const item of items) {
    const bucket = buckets.find(b => b.fase === item.FASE);
    const key = `tarea_${item.TAREA}` as const;
    if (bucket && (bucket.tareas as any)[key]) {
      (bucket.tareas as any)[key].push(item);
    }
  }
  return buckets;
}
