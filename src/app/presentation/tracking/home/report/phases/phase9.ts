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
/*
export function handlePhase9Tarea1(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 1 (sin datos)']];
}

export function handlePhase9Tarea2(item: Item): any[] {
   return [[...baseCols(item), 'Tarea 2 (sin datos)']];
}
export function handlePhase9Tarea3(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 3 (sin datos)']];
}

export function handlePhase9Tarea4(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 4 (sin datos)']];
}

export function handlePhase9Tarea5(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 5 (sin datos)']];
}
*/

export function handlePhase9Tarea1(item: Item): any[] {
  const arr = baseCols(item);
  const json = item.DATOS_JSON ?? [];
  for (let j = 0; j < json.length; j++) {
    const ans = json[j]?.answer ?? {};
    if (j === 0) {
      pushDocentesGenerosEdades(arr, ans);
    }
    if (j === 1) {
      pushDocentesGenerosEdades(arr, ans);
    }
    if (j === 2) {
      arr.push(ans?.comentario ?? '');
    }
  }
  return [arr];
}

export function handlePhase9Tarea2(item: Item): any[] {
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
      const totalNiv = pushNiveles(arr, ans?.docentes ?? []);
      arr.push(totalNiv);
      const nGen = pushCantidadList(arr, ans?.generos ?? []);
      arr.push(nGen);
      const nEd = pushCantidadList(arr, ans?.edades ?? []);
      arr.push(nEd);
    }
    if (j === 2) {
      const totalNiv = pushNiveles(arr, ans?.docentes ?? []);
      arr.push(totalNiv);
      const nGen = pushCantidadList(arr, ans?.generos ?? []);
      arr.push(nGen);
    }
    if (j === 3) {
      const totalNiv = pushNiveles(arr, ans?.docentes ?? []);
      arr.push(totalNiv);
      const nGen = pushCantidadList(arr, ans?.generos ?? []);
      arr.push(nGen);
      const nEd = pushCantidadList(arr, ans?.edades ?? []);
      arr.push(nEd);
    }
    if (j === 4) arr.push(ans?.comentario ?? '');
  }
  return [arr];
}

export function handlePhase9Tarea3(item: Item): any[] {
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
      const totalNiv = pushNiveles(arr, ans?.docentes ?? []);
      arr.push(totalNiv);
      const nGen = pushCantidadList(arr, ans?.generos ?? []);
      arr.push(nGen);
      const nEd = pushCantidadList(arr, ans?.edades ?? []);
      arr.push(nEd);
    }
    if (j === 2) {
      const totalNiv = pushNiveles(arr, ans?.docentes ?? []);
      arr.push(totalNiv);
      const nGen = pushCantidadList(arr, ans?.generos ?? []);
      arr.push(nGen);
    }
    if (j === 3) {
      const totalNiv = pushNiveles(arr, ans?.docentes ?? []);
      arr.push(totalNiv);
      const nGen = pushCantidadList(arr, ans?.generos ?? []);
      arr.push(nGen);
      const nEd = pushCantidadList(arr, ans?.edades ?? []);
      arr.push(nEd);
    }
    if (j === 4) arr.push(ans?.comentario ?? '');
  }
  return [arr];
}
export function handlePhase9Tarea4(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 4 (sin datos)']];
}

export function handlePhase9Tarea5(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 5 (sin datos)']];
}