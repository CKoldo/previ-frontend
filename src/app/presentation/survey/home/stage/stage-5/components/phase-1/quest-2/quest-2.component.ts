import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { RadioButton } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-phase-5-quest-2',
  imports: [
    FormsModule,
    CommonModule,
    //RadioButton,
    MultiSelectModule,
    InputNumberModule,
    DatePickerModule,
    SelectModule,
    InputNumberModule,
  ],
  templateUrl: './quest-2.component.html',
  styleUrl: './quest-2.component.css',
})
export class Quest2Component {
  @Input() dataEntry: any = null;
  @Input() isCompletePhase: boolean = false;
  @Input() isUpdateEnable: boolean = false;

  // Control 1
  eiceParticipacion: string = '';

  // Control 2
  accionesRecuerdan: string = '';

  // Control 3
  contenidosAcogidos: any[] = [];
  selectedContenidosAcogidos: any[] = [];

  // Control 4
  contenidosDesafio: any[] = [];
  selectedContenidosDesafio: any[] = [];

  // Control 5
  resultadosPrevencion: any[] = [];
  selectedResultadosPrevencion: any[] = [];

  // Control 6
  casosSiseve: { [key: number]: number } = {
    2022: 0,
    2023: 0,
    2024: 0,
    2025: 0,
  };

  // Add selectedTemasReforzar property
  selectedTemasReforzar: any[] = []; // Initialize as an empty array

  constructor() {
    // Control 3 y 4 opciones
    const contenidos = [
      {
        name: 'Sensibilización sobre disciplina desde el enfoque de derechos',
        code: 'CONT1',
      },
      {
        name: 'Fortalecimiento de las normas de convivencia del aula',
        code: 'CONT2',
      },
      {
        name: 'Aplicación de medidas correctivas desde el enfoque de derechos',
        code: 'CONT3',
      },
      {
        name: 'Estrategias de autocuidado y bienestar colectivo',
        code: 'CONT4',
      },
      { name: 'Mentalidades transformadoras', code: 'CONT5' },
      { name: 'Mediación y resolución de conflictos', code: 'CONT6' },
      {
        name: 'Identificación de riesgos en entornos físicos y virtuales',
        code: 'CONT7',
      },
      {
        name: 'Cultura del reporte de casos de violencia escolar',
        code: 'CONT8',
      },
      { name: 'Uso del Portal SíseVE', code: 'CONT9' },
      { name: 'Identificación de espacios inseguros', code: 'CONT10' },
      {
        name: 'Identificación de riesgos de bullying y discriminación étnico racial',
        code: 'CONT11',
      },
      { name: 'Habilidades socioemocionales - HSE', code: 'CONT12' },
      { name: 'Educación Sexual Integral – ESI', code: 'CONT13' },
      { name: 'Competencias parentales', code: 'CONT14' },
      { name: 'Participación estudiantil', code: 'CONT15' },
    ];
    this.contenidosAcogidos = [...contenidos];
    this.contenidosDesafio = [...contenidos];

    // Control 5 opciones
    this.resultadosPrevencion = [
      {
        name: 'Mejora el trato de docentes con las y los estudiantes.',
        code: 'RES1',
      },
      {
        name: 'Incremento del interés y participación de docentes en acciones del PREVI',
        code: 'RES2',
      },
      {
        name: 'Estudiantes confían en docentes que muestran empatía e interés por su bienestar.',
        code: 'RES3',
      },
      {
        name: 'Docentes que en hora de tutoría tratan temas para prevención de la violencia.',
        code: 'RES4',
      },
      {
        name: 'Mejora de las relaciones interpersonales entre integrantes de la comunidad educativa.',
        code: 'RES5',
      },
      {
        name: 'Se implementan acciones y/o sesiones para el fortalecimiento de la Educación Sexual Integral-ESI, a nivel de la IE y del aula.',
        code: 'RES6',
      },
      {
        name: 'Más personas de la escuela conocen el SíseVe para reportar hechos de violencia.',
        code: 'RES7',
      },
      {
        name: 'Se atienden los casos de violencia escolar y logra una escuela segura para estudiantes.',
        code: 'RES8',
      },
      {
        name: 'Se han promovido acciones para la prevención de la violencia escolar, desde los espacios de participación estudiantil',
        code: 'RES9',
      },
      {
        name: 'Mayor involucramiento de las familias en las acciones de la BAPE.',
        code: 'RES10',
      },
    ];
  }

  getDataSave(): any {
    return {
      eiceParticipacion: this.eiceParticipacion,
      accionesRecuerdan: this.accionesRecuerdan,
      contenidosAcogidos: this.selectedContenidosAcogidos.join(','),
      contenidosDesafio: this.selectedContenidosDesafio.join(','),
      resultadosPrevencion: this.selectedResultadosPrevencion.join(','),
      casosSiseve2022: this.casosSiseve[2022],
      casosSiseve2023: this.casosSiseve[2023],
      casosSiseve2024: this.casosSiseve[2024],
      casosSiseve2025: this.casosSiseve[2025],
    };
  }

  ngOnInit() {
    if (this.dataEntry) {
      this.eiceParticipacion = this.dataEntry.eiceParticipacion || '';
      this.accionesRecuerdan = this.dataEntry.accionesRecuerdan || '';
      this.selectedContenidosAcogidos = (
        this.dataEntry.contenidosAcogidos || ''
      )
        .split(',')
        .filter((x: string) => x);
      this.selectedContenidosDesafio = (this.dataEntry.contenidosDesafio || '')
        .split(',')
        .filter((x: string) => x);
      this.selectedResultadosPrevencion = (
        this.dataEntry.resultadosPrevencion || ''
      )
        .split(',')
        .filter((x: string) => x);
      this.casosSiseve[2022] = this.dataEntry.casosSiseve2022 || 0;
      this.casosSiseve[2023] = this.dataEntry.casosSiseve2023 || 0;
      this.casosSiseve[2024] = this.dataEntry.casosSiseve2024 || 0;
      this.casosSiseve[2025] = this.dataEntry.casosSiseve2025 || 0;
    }
  }

  validateDataSave() {
    // Validar eiceParticipacion
    //if (this.eiceParticipacion === '') {
    // Mostrar mensaje de validación para eiceParticipacion
    //return false;
    //}

    // Validar casosSiseve
    for (const year of [2022, 2023, 2024, 2025]) {
      if (this.casosSiseve[year] < 0 || isNaN(this.casosSiseve[year])) {
        // Mostrar mensaje de validación para casosSiseve
        //this.casosSiseve[year] = 0; // O establece un valor predeterminado
        return false;
      }
    }

    return true;
  }
}
