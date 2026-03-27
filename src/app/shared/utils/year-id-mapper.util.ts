/**
 * Convierte año STRING (2025, 2026) a ID_PADRON_ANIO de tipo number
 * 2025 -> 1
 * 2026 -> 2
 */
export function convertYearToIdPadronAnio(year: string | null | undefined): number {
  switch (year) {
    case '2025':
      return 1;
    case '2026':
      return 2;
    default:
      return 1;
  }
}

/**
 * Convierte ID_PADRON_ANIO (1, 2) a año STRING (2025, 2026)
 * 1 -> 2025
 * 2 -> 2026
 */
export function convertIdPadronAnioToYear(idPadron: number | null | undefined): string {
  switch (idPadron) {
    case 1:
      return '2025';
    case 2:
      return '2026';
    default:
      return '2025';
  }
}
