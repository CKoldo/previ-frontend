export function formatDateUTC(date?: any): string {
  if (!date || typeof date !== 'string') return '';
  const d = new Date(date.endsWith('Z') ? date : date + 'Z');
  if (isNaN(d.getTime())) return '';
  const day = String(d.getUTCDate()).padStart(2, '0');
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export function modalidadLabel(v: any): string {
  return v ? 'Presencial' : 'Virtual';
}

export function pushCantidadList(target: any[], list: any[] = []): number {
  let sum = 0;
  for (let i = 0; i < list.length; i++) {
    const val = Number(list[i]?.cantidad ?? 0);
    target.push(val);
    sum += val;
  }
  return sum;
}

export function pushDocentesGenerosEdades(
  target: any[],
  answer: any
): { totalDocentes: number; totalGeneros: number; totalEdades: number } {
  const nDocentes = pushCantidadList(target, answer?.docentes);
  target.push(nDocentes);
  const nGeneros = pushCantidadList(target, answer?.generos);
  target.push(nGeneros);
  const nEdades = pushCantidadList(target, answer?.edades);
  target.push(nEdades);
  return {
    totalDocentes: nDocentes,
    totalGeneros: nGeneros,
    totalEdades: nEdades,
  };
}

export function pushNiveles(target: any[], docentes: any[] = []): number {
  let total = 0;
  for (let i = 0; i < docentes.length; i++) {
    const niveles = docentes[i]?.niveles ?? [];
    for (let j = 0; j < niveles.length; j++) {
      const val = Number(niveles[j]?.cantidad ?? 0);
      target.push(val);
      total += val;
    }
  }
  return total;
}
