import { PhaseRangesConfig } from '../types';

export const RANGOS_BY_PHASE: PhaseRangesConfig[] = [
  {
    fase: 1,
    tareas: {
      tarea_1: {
        rangos: ['B10:W10', 'Y10:AL10', 'AN10:AX10', 'AZ10:BN10', 'BP10'],
        datos: [],
      },
      tarea_2: { rangos: ['B10:Y10', 'AA10'], datos: [] },
      tarea_3: {
        rangos: ['B10:P10', 'R10:AA10', 'AC10:AG10', 'AI10'],
        datos: [],
      },
      tarea_4: { rangos: ['B10:H10', 'J10:S10', 'U10'], datos: [] },
      tarea_5: {
        rangos: ['B10:W10', 'Y10:AL10', 'AN10:AX10', 'AZ10:BN10', 'BP10'],
        datos: [],
      },
    },
  },
  {
    fase: 2,
    tareas: {
      tarea_1: { rangos: ['B10:AG10', 'AI10'], datos: [] },
      tarea_2: { rangos: ['B10:R10', 'T10'], datos: [] },
      tarea_3: { rangos: ['B10:W10', 'Y10:AL10', 'AN10'], datos: [] },
      tarea_4: { rangos: ['B10:AG10', 'AI10'], datos: [] },
      tarea_5: {
        rangos: ['B10:W10', 'Y10:AL10', 'AN10:AX10', 'AZ10:BN10', 'BP10'],
        datos: [],
      },
    },
  },
  {
    fase: 3,
    tareas: {
      tarea_1: { rangos: ['B10:R10', 'T10'], datos: [] },
      tarea_2: { rangos: ['B10:R10', 'T10:Z10', 'AB10'], datos: [] },
      tarea_3: { rangos: ['B10:R10', 'T10:Z10', 'AB10'], datos: [] },
      tarea_4: { rangos: ['B10:W10', 'Y10'], datos: [] },
      tarea_5: {
        rangos: ['B10:W10', 'Y10:AL10', 'AN10:AX10', 'AZ10:BN10', 'BP10'],
        datos: [],
      },
    },
  },
  {
    fase: 4,
    tareas: {
      tarea_1: {
        rangos: ['B10:R10', 'T10:X10', 'Z10:AD10', 'AF10'],
        datos: [],
      },
      tarea_2: { rangos: ['B10:V10', 'X10:AH0', 'AJ10'], datos: [] }, // Nota: "AH0" proviene del original
      tarea_3: { rangos: ['B10:W10', 'Y10:AC10', 'AE10'], datos: [] },
      tarea_4: { rangos: ['B10:R10', 'T10:AH10', 'AJ10'], datos: [] },
      tarea_5: {
        rangos: ['B10:W10', 'Y10:AL10', 'AN10:AX10', 'AZ10:BN10', 'BP10'],
        datos: [],
      },
    },
  },
  {
    fase: 5,
    tareas: {
      tarea_1: {
        rangos: ['B10:W10', 'Y10:AG10', 'AI10:AM10', 'AO10'],
        datos: [],
      },
      tarea_2: {
        rangos: ['B10:H10', 'I10:R10', 'T10:AR10', 'AT10'],
        datos: [],
      },
    },
  },
];

export const RANGOS_BY_PHASE_2026: PhaseRangesConfig[] = [
  {
    fase: 6,
    tareas: {
      tarea_1: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AI12', 'AK12:AT12', 'AV12'],
        datos: [],
      },
      tarea_2: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AS12', 'AU12'],
        datos: [],
      },
      tarea_3: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AS12', 'AU12'],
        datos: [],
      },
      tarea_4: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AD12', 'AF12'],
        datos: [],
      },
    },
  },
  {
    fase: 7,
    tareas: {
      tarea_1: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AS12', 'AU12'],
        datos: [],
      },
      tarea_2: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AS12', 'AU12'],
        datos: [],
      },
      tarea_3: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AS12', 'AU12'],
        datos: [],
      },
      tarea_4: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AS12', 'AU12'],
        datos: [],
      },
      tarea_5: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AD12', 'AF12'],
        datos: [],
      },
    },
  },
  {
    fase: 8,
    tareas: {
      tarea_1: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AS12', 'AU12'],
        datos: [],
      },
      tarea_2: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AS12', 'AU12'],
        datos: [],
      },
      tarea_3: {
        rangos: ['B12:H12', 'J12:X12', 'Z12:AM12', 'AO12:AY12','BA12:BO12', 'BQ12'],
        datos: [],
      },
      tarea_4: {
        rangos: ['B12:H12', 'J12:X12', 'Z12:AM12', 'AO12:AY12','BA12:BO12', 'BQ12'],
        datos: [],
      },
      tarea_5: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AD12', 'AF12'],
        datos: [],
      },
    },
  },
  {
    fase: 9,
    tareas: {
      tarea_1: {
        rangos: ['B12:H12', 'J12:S12', 'U12:AD12', 'AF12'],
        datos: [],
      },
      tarea_2: {
        rangos: ['B12:H12', 'J12:X12', 'Z12:AM12', 'AO12:AY12','BA12:BO12', 'BQ12'],
        datos: [],
      },
      tarea_3: {
        rangos: ['B12:H12', 'J12:X12', 'Z12:AM12', 'AO12:AY12','BA12:BO12', 'BQ12'],
        datos: [],
      }
    },
  },
  { fase: 10, tareas: {} },
];
