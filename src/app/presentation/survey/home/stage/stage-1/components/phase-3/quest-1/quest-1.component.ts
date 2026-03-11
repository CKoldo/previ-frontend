import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-phase-3-quest-1',
  imports: [FormsModule, CommonModule,DropdownModule,InputNumberModule],
  templateUrl: './quest-1.component.html',
  styleUrl: './quest-1.component.css'
})
export class Quest1Component {
  @Input() dataEntry: any=null;
  @Input() isCompletePhase :boolean= false;
  @Input() isUpdateEnable: boolean = false;
  docentes = [

    {
      label: "Directivos(as)",
     cantidad:0
    },
    {
      label: "Responsable(s) de convivencia",
      cantidad:0
    },
    {
      label: "Coordinadores(as) de Tutoría",
      cantidad:0
    },
    {
      label: "Responsable de Inclusión",
      cantidad:0
    },
    {
      label: "Psicólogo/a (diferente al EICE o SP)",
      cantidad:0
    },
    {
      label: "Representante(s) de estudiantes",
      cantidad:0
    },
    {
      label: "Representante(s) de madres y padres de familia",
      cantidad:0
    }


];

ngOnInit() {
  if(this.dataEntry){
    this.docentes = this.dataEntry.docentes || this.docentes;
  }
}

getTotalDocentes(): number {
  return this.docentes.reduce((sum, docente) =>
    sum + ((docente.cantidad * 1) || 0), 0);
}

getDataSave(): any {
  return {
    docentes: this.docentes
  };
}

validateDataSave(){
  return true;
}

}
