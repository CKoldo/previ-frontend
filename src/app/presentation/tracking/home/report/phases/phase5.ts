// Placeholder handlers para tareas 2-5

export function handlePhase5Tarea3(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 3 (sin datos)']];
}

export function handlePhase5Tarea4(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 4 (sin datos)']];
}

export function handlePhase5Tarea5(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 5 (sin datos)']];
}
import { Item } from '../types';
import {
  formatDateUTC,
  modalidadLabel,
  pushCantidadList,
  pushDocentesGenerosEdades,
  pushNiveles,
} from '../utils';

function baseCols(item: Item): any[] {
  return [
    item?.NUMERO_DOCUMENTO ?? '',
    item?.DRE ?? '',
    item?.UGEL ?? '',
    item?.CODIGO_LOCAL ?? '',
    item?.NOMBRE_INSTITUCION ?? '',
    formatDateUTC(item?.FECHA_MODALIDAD),
    modalidadLabel(item?.MODALIDAD),
  ];
}

export function handlePhase5Tarea1(item: Item): any[] {
  const arr = baseCols(item);
  const json = item.DATOS_JSON ?? [];
  for (let j = 0; j < json.length; j++) {
    const ans = json[j]?.answer ?? {};
    if (j === 0) {
      const nDoc = pushCantidadList(arr, ans?.docentes ?? []);
      arr.push(nDoc);
      const nGen = pushCantidadList(arr, ans?.generos ?? []);
      arr.push(nGen);
      const nEd = pushCantidadList(arr, ans?.edades ?? []);
      arr.push(nEd);
    }
    if (j === 1) {
      arr.push(String(ans?.eiceParticipacion ?? '').toLowerCase() === 'true' ? 'Si' : 'No');
      arr.push(ans?.accionesRecuerdan ?? '');
      arr.push(ans?.contenidosAcogidos ?? '');
      arr.push(ans?.contenidosDesafio ?? '');
      arr.push(ans?.resultadosPrevencion ?? '');
      arr.push(ans?.casosSiseve2022 ?? 0);
      arr.push(ans?.casosSiseve2023 ?? 0);
      arr.push(ans?.casosSiseve2024 ?? 0);
      arr.push(ans?.casosSiseve2025 ?? 0);
    }
    if (j === 2) {
      arr.push(ans?.situacionReporte ?? '');
      arr.push(ans?.historialReporte ?? '');
      arr.push(ans?.dificultades ?? '');
      arr.push(ans?.temasReforzar ?? '');
      arr.push(ans?.accionesPropuestas ?? '');
    }
    if (j === 3) arr.push(ans?.comentario ?? '');
  }
  return [arr];
}

export function handlePhase5Tarea2(item: Item): any[] {
  const arr = baseCols(item);
  const json = item.DATOS_JSON ?? [];
  for (let j = 0; j < json.length; j++) {
    const ans = json[j]?.answer ?? {};
    if (j === 0) {
      pushDocentesGenerosEdades(arr, ans);
    }
    if (j === 1) {
      let totalDoc = 0;
      const docentes = ans?.docentes ?? [];
      for (let k = 0; k < docentes.length; k++) {
        const niveles = docentes[k]?.niveles ?? [];
        let subtotal = 0;
        for (let l = 0; l < niveles.length; l++) {
          const v = Number(niveles[l]?.cantidad ?? 0);
          arr.push(v);
          subtotal += v;
        }
        totalDoc += subtotal;
        arr.push(subtotal);
      }
      arr.push(totalDoc);
      const nGen = pushCantidadList(arr, ans?.generos ?? []);
      arr.push(nGen);
      const nEd = pushCantidadList(arr, (ans as any)?.esdades ?? ans?.edades ?? []);
      arr.push(nEd);
    }
    if (j === 2) {
      arr.push(ans?.comentario ?? '');
    }
  }
  return [arr];
  // Devuelve solo las columnas base y un mensaje de placeholder
  //return [[...baseCols(item), 'Tarea 2 (sin datos)']];
}