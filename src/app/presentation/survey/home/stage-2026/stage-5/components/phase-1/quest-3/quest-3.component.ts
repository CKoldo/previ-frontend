
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-phase-5-quest-3',
  imports: [FormsModule, CommonModule, SelectModule, MultiSelectModule],
  templateUrl: './quest-3.component.html',
  styleUrl: './quest-3.component.css',
})
export class Quest3Component {
  @Input() dataEntry: any = null;
  @Input() isCompletePhase: boolean = false;
  @Input() isUpdateEnable: boolean = false;

  // Control 1
  situacionReporteOptions = [
    { label: 'No ha habido reportes de casos de violencia en ninguno de esos años.', value: 'no_reportes' },
    { label: 'Se empezó a reportar casos de violencia de la IE en el SíseVe, entre el 2023 al 2025.', value: 'empezo_reportar' },
    { label: 'Se reportó en uno de estos años, pero en el año 2025 no hay reportes.', value: 'no_2025' },
    { label: 'Se mantuvo el número de reportes que existía antes del PREVI.', value: 'mantuvo_numero' },
    { label: 'Se redujo el número de reportes en el SíseVe.', value: 'redujo_numero' },
  ];
  situacionReporte: string = '';

  // Control 2
  historialReporte: string = '';

  // Control 3
  dificultadesOptions = [
    { label: 'Se comparte información descontextualizada de la realidad de la IE.', value: 'descontextualizada' },
    { label: 'Se comparte información que no es útil para la IE.', value: 'no_util' },
    { label: 'Docentes que se resisten a participar en las acciones de prevención de la violencia.', value: 'docentes_resisten' },
    { label: 'Limitaciones de tiempo para participar en las acciones del PREVI.', value: 'limite_tiempo' },
    { label: 'Las horas de tutoría se usan para avanzar con otras áreas curriculares', value: 'tutoria_otras_areas' },
    { label: 'Resistencia de integrantes de la comunidad a reportar y atender los casos de violencia presentados en la IE.', value: 'resistencia_comunidad' },
    { label: 'Otro', value: 'otro' },
  ];
  selectedDificultades: string[] = [];

  // Control 4
  temasReforzarOptions = [
    { label: 'Elaboración, aplicación y seguimiento a las normas de convivencia', value: 'normas_convivencia' },
    { label: 'Desarrollo de habilidades socioemocionales', value: 'habilidades_socioemocionales' },
    { label: 'Autocuidado del docente', value: 'autocuidado_docente' },
    { label: 'Estrategias para el desarrollo de la disciplina y autorregulación', value: 'estrategias_disciplina' },
    { label: 'Identificación de riesgos de violencia', value: 'riesgos_violencia' },
    { label: 'Desarrollo de la cultura del reporte', value: 'cultura_reporte' },
    { label: 'Orientaciones para el uso del SíseVe', value: 'orientaciones_siseve' },
    { label: 'Riesgos en entornos virtuales y por redes sociales', value: 'riesgos_virtuales' },
    { label: 'Manejo de conflictos entre diferentes integrantes de la escuela', value: 'manejo_conflictos' },
    { label: 'Discriminación', value: 'discriminacion' },
    { label: 'Protagonismo estudiantil', value: 'protagonismo_estudiantil' },
    { label: 'Educación Sexual Integral - ESI', value: 'esi' },
  ];
  //selectedTemasReforzar: string[] = [];
  selectedTemasReforzar: { label: string; value: string }[] = [];

  // Control 5
  accionesPropuestas: string = '';

  getDataSave(): any {
    return {
      situacionReporte: this.situacionReporte,
      historialReporte: this.historialReporte,
      dificultades: this.selectedDificultades.join(','),
      temasReforzar: this.selectedTemasReforzar.join(','),
      accionesPropuestas: this.accionesPropuestas
    };
  }

  ngOnInit() {
    if (this.dataEntry) {
      const temasReforzarValues = (this.dataEntry.temasReforzar || '').split(',').filter((x: string) => x);

      this.situacionReporte = this.dataEntry.situacionReporte || '';
      this.historialReporte = this.dataEntry.historialReporte || '';
      this.selectedDificultades = (this.dataEntry.dificultades || '').split(',').filter((x: string) => x);
      this.selectedTemasReforzar = (this.dataEntry.temasReforzar || '').split(',').filter((x: string) => x);
      // this.selectedTemasReforzar = this.temasReforzarOptions.filter(option =>
      //   temasReforzarValues.includes(option.value)
      // );
      this.accionesPropuestas = this.dataEntry.accionesPropuestas || '';
    }
  }

  validateDataSave() {
    // if (!this.situacionReporte) return false;
    // if (!this.historialReporte || this.historialReporte.trim() === '') return false;
    // if (this.selectedDificultades.length === 0) return false;
    //if (this.selectedTemasReforzar.length === 0) return false;
    // if (!this.accionesPropuestas || this.accionesPropuestas.trim() === '') return false;
    // if (this.selectedTemasReforzar.length > 5) {
    //   return false;
    // }

    return true;
  }
}
