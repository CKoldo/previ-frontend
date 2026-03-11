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
export function handlePhase7Tarea1(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 1 (sin datos)']];}
export function handlePhase7Tarea2(item: Item): any[] {
   return [[...baseCols(item), 'Tarea 2 (sin datos)']];}
export function handlePhase7Tarea3(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 3 (sin datos)']];}
export function handlePhase7Tarea4(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 4 (sin datos)']];}
export function handlePhase7Tarea5(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 5 (sin datos)']];}
*/
export function handlePhase7Tarea1(item: Item): any[] {
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
}

export function handlePhase7Tarea2(item: Item): any[] {
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
}

export function handlePhase7Tarea3(item: Item): any[] {
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
}

export function handlePhase7Tarea4(item: Item): any[] {
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
}

export function handlePhase7Tarea5(item: Item): any[] {
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