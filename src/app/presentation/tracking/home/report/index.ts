import { ScheduleYear } from 'app/shared/utils/stage-storage.util';
import { CommandLike, PhaseRangesConfig, RangoConfig, RawItem, SheetConf, TareaKey, UserData } from './types';
import { normalizeRaw, groupByPhaseTask } from './group';
import { RANGOS_BY_PHASE, RANGOS_BY_PHASE_2026 } from './config/rangos.config';
import { dispatchRow } from './task-dispatcher';

const YEAR_PHASES: Record<ScheduleYear, number[]> = {
  '2025': [1, 2, 3, 4, 5],
  '2026': [6, 7, 8, 9, 10],
};

function getUserData(localStorage: Storage): UserData | null {
  const raw = localStorage.getItem('dataUser');
  if (!raw) return null;
  try { return JSON.parse(raw) as UserData; } catch { return null; }
}

export async function prepareDataForReport(
  _GenerateReportCommand: CommandLike,
  localStorage: Storage,
  year: ScheduleYear
): Promise<SheetConf[] | null> {
  const dataUser = getUserData(localStorage);
  const nameDRE  = dataUser?.DRE_ORI?.trim() ?? '';
  const nameUGEL = dataUser?.TIPO_INSTITUCION == 2 ? (dataUser?.UGEL_ORI?.trim() ?? '') : '';

  const payload = {
    DRE: nameDRE,
    UGEL: nameUGEL,
    NOMBRE: '',
    ID_TIPO_INSTITUCION: dataUser?.TIPO_INSTITUCION,
    NUMERO_DOCUMENTO: dataUser?.NUMERO_DOCUMENTO,
  };

  let datos: RawItem[] = await _GenerateReportCommand.execute(payload);
  if (!datos || datos.length === 0) return null;

  const normalized = normalizeRaw(datos);
  const buckets = groupByPhaseTask(normalized);

  const rangesSource = year === '2026' ? RANGOS_BY_PHASE_2026 : RANGOS_BY_PHASE;
  const ranges: PhaseRangesConfig[] = JSON.parse(JSON.stringify(rangesSource));
  const rangesByPhase = new Map<number, PhaseRangesConfig>();
  for (const range of ranges) {
    rangesByPhase.set(range.fase, range);
  }

  const allowedPhases = new Set(YEAR_PHASES[year]);
  const confReturn: SheetConf[] = [];

  for (const bucket of buckets) {
    if (!allowedPhases.has(bucket.fase)) {
      continue;
    }

    const phaseRange = rangesByPhase.get(bucket.fase);
    if (!phaseRange) continue;

    const tareasConfig = phaseRange.tareas as Partial<Record<TareaKey, RangoConfig>>;

    (Object.keys(bucket.tareas) as TareaKey[]).forEach((tareaKey: TareaKey) => {
      const items = (bucket.tareas as any)[tareaKey] || [];
      const tareaConfig = tareasConfig[tareaKey];
      if (!tareaConfig) {
        return;
      }

      for (const item of items) {
        const dispatched = dispatchRow(item);
        if (!dispatched) continue;
        for (const row of dispatched.rows) {
          tareaConfig.datos.push(row);
        }
      }

      const lengthData = tareaConfig.datos.length;

      // Solo agregar la hoja si hay datos
      if (lengthData > 0) {
        const sheetPhase = year === '2026' ? bucket.fase - 5 : bucket.fase;
        const hoja = `fase_${sheetPhase}_${tareaKey}`;
        confReturn.push({
          hoja,
          rangos: tareaConfig.rangos,
          datos : tareaConfig.datos,
        });
      }
    });
  }

  return confReturn;
}
