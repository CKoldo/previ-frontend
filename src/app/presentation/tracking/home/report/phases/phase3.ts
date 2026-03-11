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

// TODO: Implementar la lógica específica de Fase 3 según tu código original
export function handlePhase3Tarea1(item: Item): any[] {
  const arr = baseCols(item);
  const json = item.DATOS_JSON ?? [];
  for (let j = 0; j < json.length; j++) {
    const ans = json[j]?.answer ?? {};
    if (j === 0) {
      const { totalDocentes, totalGeneros, totalEdades } =
        pushDocentesGenerosEdades(arr, ans);
      // arr.push(totalDocentes);
      // arr.push(totalGeneros);
      // arr.push(totalEdades);
    }
    if (j === 1) {
      arr.push(ans?.comentario ?? '');
    }
  }
  return [arr];
}
export function handlePhase3Tarea2(item: Item): any[] {
  const arr = baseCols(item);
  const json = item.DATOS_JSON ?? [];
  for (let j = 0; j < json.length; j++) {
    const ans = json[j]?.answer ?? {};
    if (j === 0) {
      const { totalDocentes, totalGeneros, totalEdades } =
        pushDocentesGenerosEdades(arr, ans);
      // arr.push(totalDocentes);
      // arr.push(totalGeneros);
      // arr.push(totalEdades);
    }
    if (j === 1) {
      arr.push(formatDateUTC(ans?.pregunta5));
      arr.push(
        String(ans?.pregunta1 ?? '').toLowerCase() === 'true' ? 'Si' : 'No'
      );
      arr.push(ans?.pregunta2 ?? '');
      arr.push(
        String(ans?.pregunta3 ?? '').toLowerCase() === 'true' ? 'Si' : 'No'
      );
      arr.push(ans?.pregunta4 ?? 0);
      arr.push(
        String(ans?.pregunta6 ?? '').toLowerCase() === 'true' ? 'Si' : 'No'
      );
      arr.push(ans?.pregunta7 ?? 0);
    }
    if (j === 2) {
      arr.push(ans?.comentario ?? '');
    }
  }
  return [arr];
}
export function handlePhase3Tarea3(item: Item): any[] {
  const arr = baseCols(item);
  const json = item.DATOS_JSON ?? [];
  for (let j = 0; j < json.length; j++) {
    const ans = json[j]?.answer ?? {};
    if (j === 0) {
      const { totalDocentes, totalGeneros, totalEdades } =
        pushDocentesGenerosEdades(arr, ans);
      // arr.push(totalDocentes);
      // arr.push(totalGeneros);
      // arr.push(totalEdades);
    }
    if (j === 1) {
      arr.push(formatDateUTC(ans?.pregunta5));
      arr.push(
        String(ans?.pregunta1 ?? '').toLowerCase() === 'true' ? 'Si' : 'No'
      );
      arr.push(ans?.pregunta2 ?? '');
      arr.push(
        String(ans?.pregunta3 ?? '').toLowerCase() === 'true' ? 'Si' : 'No'
      );
      arr.push(ans?.pregunta4 ?? 0);
      arr.push(
        String(ans?.pregunta6 ?? '').toLowerCase() === 'true' ? 'Si' : 'No'
      );
      arr.push(ans?.pregunta7 ?? 0);
    }
    if (j === 2) {
      arr.push(ans?.comentario ?? '');
    }
  }
  return [arr];
}
export function handlePhase3Tarea4(item: Item): any[] {
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
    if (j === 1) arr.push(ans?.comentario ?? '');
  }
  return [arr];
}
export function handlePhase3Tarea5(item: Item): any[] {
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
