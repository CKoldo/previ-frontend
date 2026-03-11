import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RadioButton } from 'primeng/radiobutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-phase-3-quest-3',
  imports: [FormsModule, CommonModule, RadioButton, MultiSelectModule,InputNumberModule,DatePickerModule],
  templateUrl: './quest-3.component.html',
  styleUrl: './quest-3.component.css',
})
export class Quest3Component {
  @Input() dataEntry: any=null;
  quest1!: string;
  quest2!: string;

  members!: any[];

  selectedMembersQ1: any[] = [];
  @Input() isCompletePhase :boolean= false;
  @Input() isUpdateEnable: boolean = false;
  cantidadDocentes: number = 0;
  fechaEjecucion: Date=new Date();

  constructor() {
    this.members = [
      { name: 'Directivos(as)', code: 'DIR' },
      { name: 'Responsable(s) de convivencia', code: 'RCV' },
      { name: 'Coordinadores(as) de Tutoría', code: 'CTU' },
      { name: 'Responsable de Inclusión', code: 'INC' },
      { name: 'Psicólogo/a (diferente al EICE o SP)', code: 'PSI' },
      { name: 'Representante(s) de estudiantes', code: 'EST' },
      { name: 'Representante(s) de madres y padres de familia', code: 'MPF' },
    ];
  }

  getDataSave(): any {
    return {
      pregunta1: this.quest1,
      pregunta2: this.selectedMembersQ1.join(','),
      pregunta3: this.quest2,
      pregunta4: this.cantidadDocentes,
      pregunta5: this.fechaEjecucion.toISOString()
    };
  }

  ngOnInit() {
    if(this.dataEntry){
      this.quest1 = this.dataEntry.pregunta1 || null;
      this.selectedMembersQ1 = (this.dataEntry.pregunta2 || '').split(',');
      this.quest2 = this.dataEntry.pregunta3 || null;
      this.cantidadDocentes = this.dataEntry.pregunta4 || 0;
      if(this.dataEntry.pregunta5){
        this.fechaEjecucion = this.convertToDate(this.dataEntry.pregunta5.split('T')[0]);
      }
    }
  }

  onQuest1Change(event: any) {
    this.quest1 = event;
    this.selectedMembersQ1 = [];
  }

  onQuest2Change(event: any) {
    this.quest2 = event;
    this.cantidadDocentes = 0;
  }

  validateDataSave() {
    if (this.quest1 == null || this.quest1 == undefined || this.quest1 == '') {
      return false;
    }
    if (this.quest1 == 'true') {
      if (this.selectedMembersQ1.length == 0) {
        return false;
      }
    }

    if (this.quest2 == null || this.quest2 == undefined || this.quest2 == '') {
      return false;
    }
    if (this.quest2 == 'true') {
      if (this.cantidadDocentes.toString().trim() == '') {
        return false;
      }
    }

    if (this.fechaEjecucion == null || this.fechaEjecucion == undefined) {
      return false;
    }

    return true;
  }

  validateDisable(opc:string){
    if(opc=="true"){
      if(this.isCompletePhase){
        if(this.isUpdateEnable){
          return true;
        }
        return false;
      }
      return true;
    }else{
      return false;
    }
  }

  convertToDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
