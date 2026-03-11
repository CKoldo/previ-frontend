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

export function handlePhase10Tarea1(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 1 (sin datos)']];
}

export function handlePhase10Tarea2(item: Item): any[] {
   return [[...baseCols(item), 'Tarea 2 (sin datos)']];
}
export function handlePhase10Tarea3(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 3 (sin datos)']];
}

export function handlePhase10Tarea4(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 4 (sin datos)']];
}

export function handlePhase10Tarea5(item: Item): any[] {
  return [[...baseCols(item), 'Tarea 5 (sin datos)']];
}
