import { Injectable } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
   constructor(private http: HttpClient) {}

  // Convierte letras de columna (A, AA, etc.) a número de columna
  private colLetterToNumber(letter: string): number {
    let col = 0;
    for (let i = 0; i < letter.length; i++) {
      col *= 26;
      col += letter.charCodeAt(i) - 64;
    }
    return col;
  }

  async exportarReportePorRangos(
    configs: {
      hoja: string;
      rangos: string[];
      datos: any[];
    }[],
    options: { templatePath?: string; fileName?: string } = {}
  ) {
    const templatePath = options.templatePath ?? 'assets/template/reporte-previ-formato.xlsx';
    const fileName = options.fileName ?? 'reporte-previ.xlsx';

    const response: any = await this.http
      .get(templatePath, { responseType: 'blob' })
      .toPromise();
    const buffer = await response.arrayBuffer();

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);


    for (const config of configs) {
      const ws = workbook.getWorksheet(config.hoja);
      if (!ws) continue;

      for (let i = 0; i < config.datos.length; i++) {
        const filaBase = 12 + i;
        const filaDatos = config.datos[i];
        let dataIndex = 0;

        for (const rango of config.rangos) {
          if (rango.includes(':')) {
            const [inicio, fin] = rango.split(':');

            const startColLetter = inicio.match(/[A-Z]+/i)?.[0] ?? 'A';
            const endColLetter = fin.match(/[A-Z]+/i)?.[0] ?? 'A';

            const colInicio = this.colLetterToNumber(startColLetter);
            const colFin = this.colLetterToNumber(endColLetter);

            for (let col = colInicio; col <= colFin; col++) {
              const cell = ws.getRow(filaBase).getCell(col);
              cell.value = filaDatos[dataIndex++] ?? '';
            }
          } else {
            const colLetter = rango.match(/[A-Z]+/i)?.[0] ?? 'A';
            const col = this.colLetterToNumber(colLetter);

            const cell = ws.getRow(filaBase).getCell(col);
            cell.value = filaDatos[dataIndex++] ?? '';
          }
        }
      }
    }

    const finalBuffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([finalBuffer]), fileName);
  }
}
