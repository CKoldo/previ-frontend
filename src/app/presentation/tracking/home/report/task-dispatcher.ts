import { Item, TareaKey } from './types';
// Handler vacío para tareas inexistentes
const emptyHandler: Handler = () => [];
import {
  handlePhase1Tarea1,
  handlePhase1Tarea2,
  handlePhase1Tarea3,
  handlePhase1Tarea4,
  handlePhase1Tarea5,
} from './phases/phase1';
import {
  handlePhase2Tarea1,
  handlePhase2Tarea2,
  handlePhase2Tarea3,
  handlePhase2Tarea4,
  handlePhase2Tarea5,
} from './phases/phase2';
import {
  handlePhase3Tarea1,
  handlePhase3Tarea2,
  handlePhase3Tarea3,
  handlePhase3Tarea4,
  handlePhase3Tarea5,
} from './phases/phase3';
import {
  handlePhase4Tarea1,
  handlePhase4Tarea2,
  handlePhase4Tarea3,
  handlePhase4Tarea4,
  handlePhase4Tarea5,
} from './phases/phase4';
import {
  handlePhase5Tarea1,
  handlePhase5Tarea2,
  handlePhase5Tarea3,
  handlePhase5Tarea4,
  handlePhase5Tarea5
} from './phases/phase5';
import {
  handlePhase6Tarea1,
  handlePhase6Tarea2,
  handlePhase6Tarea3,
  handlePhase6Tarea4,
  handlePhase6Tarea5
} from './phases/phase6';
import {
  handlePhase7Tarea1,
  handlePhase7Tarea2,
  handlePhase7Tarea3,
  handlePhase7Tarea4,
  handlePhase7Tarea5
} from './phases/phase7';
import {
  handlePhase8Tarea1,
  handlePhase8Tarea2,
  handlePhase8Tarea3,
  handlePhase8Tarea4,
  handlePhase8Tarea5
} from './phases/phase8';
import {
  handlePhase9Tarea1,
  handlePhase9Tarea2,
  handlePhase9Tarea3,
  handlePhase9Tarea4,
  handlePhase9Tarea5
} from './phases/phase9';

type Handler = (item: Item) => any[];

const emptyPhaseHandlers: Record<TareaKey, Handler> = {
  tarea_1: emptyHandler,
  tarea_2: emptyHandler,
  tarea_3: emptyHandler,
  tarea_4: emptyHandler,
  tarea_5: emptyHandler,
};

const map: Record<number, Partial<Record<TareaKey, Handler>>> = {
  1: {
    tarea_1: handlePhase1Tarea1,
    tarea_2: handlePhase1Tarea2,
    tarea_3: handlePhase1Tarea3,
    tarea_4: handlePhase1Tarea4,
    tarea_5: handlePhase1Tarea5,
  },
  2: {
    tarea_1: handlePhase2Tarea1,
    tarea_2: handlePhase2Tarea2,
    tarea_3: handlePhase2Tarea3,
    tarea_4: handlePhase2Tarea4,
    tarea_5: handlePhase2Tarea5,
  },
  3: {
    tarea_1: handlePhase3Tarea1,
    tarea_2: handlePhase3Tarea2,
    tarea_3: handlePhase3Tarea3,
    tarea_4: handlePhase3Tarea4,
    tarea_5: handlePhase3Tarea5,
  },
  4: {
    tarea_1: handlePhase4Tarea1,
    tarea_2: handlePhase4Tarea2,
    tarea_3: handlePhase4Tarea3,
    tarea_4: handlePhase4Tarea4,
    tarea_5: handlePhase4Tarea5,
  },
  5: {
    tarea_1: handlePhase5Tarea1,
    tarea_2: handlePhase5Tarea2,
    tarea_3: emptyHandler,
    tarea_4: emptyHandler,
    tarea_5: emptyHandler,
  },
  6:{
    tarea_1: handlePhase6Tarea1,
    tarea_2: handlePhase6Tarea2,
    tarea_3: handlePhase6Tarea3,
    tarea_4: handlePhase6Tarea4,
    tarea_5: handlePhase6Tarea5,
  },
  7: {
    tarea_1: handlePhase7Tarea1,
    tarea_2: handlePhase7Tarea2,
    tarea_3: handlePhase7Tarea3,
    tarea_4: handlePhase7Tarea4,
    tarea_5: handlePhase7Tarea5,
  },
  8: {
    tarea_1: handlePhase8Tarea1,
    tarea_2: handlePhase8Tarea2,
    tarea_3: handlePhase8Tarea3,
    tarea_4: handlePhase8Tarea4,
    tarea_5: handlePhase8Tarea5,
  },
  9: {
    tarea_1: handlePhase9Tarea1,
    tarea_2: handlePhase9Tarea2,
    tarea_3: handlePhase9Tarea3,
    tarea_4: emptyHandler,
    tarea_5: emptyHandler,
  },
  10: emptyPhaseHandlers,
};

export function dispatchRow(
  item: Item
): { tareaKey: TareaKey; rows: any[] } | null {
  const fase = Number(item.FASE);
  const tareaKey = `tarea_${item.TAREA}` as TareaKey;
  const handlers = map[fase];
  if (!handlers) return null;
  const fn = handlers[tareaKey];
  if (!fn) return null;
  return { tareaKey, rows: fn(item) };
}
