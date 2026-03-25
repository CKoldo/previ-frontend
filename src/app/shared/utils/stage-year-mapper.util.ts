import { ScheduleYear } from './stage-storage.util';

const YEAR_2026: ScheduleYear = '2026';
//INGRESAR
const UI_TO_API_STAGE_2026: Record<number, number> = {
  1: 6,
  2: 7,
  3: 8,
  4: 9,
  5: 10,
};
//LEER
const API_TO_UI_STAGE_2026: Record<number, number> = {
  6: 1,
  7: 2,
  8: 3,
  9: 4,
  10: 5,
};

export function resolveApiStage(stage: number, year?: string | null): number {
  if (year === YEAR_2026) {
    return UI_TO_API_STAGE_2026[stage] ?? stage;
  }
  return stage;
}

export function resolveUiStage(apiStage: number, year?: string | null): number {
  if (year === YEAR_2026) {
    return API_TO_UI_STAGE_2026[apiStage] ?? apiStage;
  }
  return apiStage;
}

