import { Item } from '../types';
import { formatDateUTC, modalidadLabel, pushCantidadList, pushNiveles } from '../utils';

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

export function handlePhase2Tarea1(item: Item): any[] {
  const arr = baseCols(item);
  const json = item.DATOS_JSON ?? [];
  for (let j = 0; j < json.length; j++) {
    const ans = json[j]?.answer ?? {};
    if (j === 0) {
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
    if (j === 1) arr.push(ans?.comentario ?? '');
  }
  return [arr];
}

export function handlePhase2Tarea2(item: Item): any[] {
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

export function handlePhase2Tarea3(item: Item): any[] {
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
    if (j === 2) arr.push(ans?.comentario ?? '');
  }
  return [arr];
}

export function handlePhase2Tarea4(item: Item): any[] {
  const arr = baseCols(item);
  const json = item.DATOS_JSON ?? [];
  for (let j = 0; j < json.length; j++) {
    const ans = json[j]?.answer ?? {};
    if (j === 0) {
      const docentes = ans?.docentes ?? [];
      let totalDoc = 0;
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
      const nEd = pushCantidadList(arr, ans?.edades ?? []);
      arr.push(nEd);
    }
    if (j === 1) arr.push(ans?.comentario ?? '');
  }
  return [arr];
}

export function handlePhase2Tarea5(item: Item): any[] {
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
