import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-phase-3-quest-1',
  standalone: true,
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

generos=[
{
  label: "Mujeres",
 cantidad:0
},
{
  label: "Hombres",
 cantidad:0
},
]

edades=[
{
  label: "Menores a 35 años",
 cantidad:0
},
{
  label: "De 35 a 50 años",
 cantidad:0
},
{
  label: "Mayores a 50 años",
 cantidad:0
}
];

isGenerosInvalid: boolean = false;
isEdadesInvalid: boolean = false;

ngOnInit() {
  if(this.dataEntry){
    this.docentes = this.dataEntry.docentes || this.docentes;
    this.generos = this.dataEntry.generos || this.generos;
    this.edades = this.dataEntry.edades || this.edades;
  }
}


getTotalDocentes(): number {
return this.docentes.reduce((sum, docente) =>
  sum + ((docente.cantidad * 1) || 0), 0);
}

getTotalGeneros(): number {
return this.generos.reduce((sum, genero) =>
  sum + ((genero.cantidad * 1) || 0), 0);
}

getTotalEdades(): number {
return this.edades.reduce((sum, edad) =>
  sum + ((edad.cantidad * 1) || 0), 0);
}

validateTotals() {
  const totalDocentes = this.getTotalDocentes();
  this.isGenerosInvalid = this.getTotalGeneros() !== totalDocentes;
  this.isEdadesInvalid = this.getTotalEdades() !== totalDocentes;
}

changeCantidadDocentes() {
  this.validateTotals();
}

changeCantidadGeneros() {
  this.validateTotals();
}

changeCantidadEdades() {
  this.validateTotals();
}

getDataSave(){
return {
  docentes: this.docentes,
  generos: this.generos,
  edades: this.edades
};
}

validateDataSave(){
  const totalDocentes = this.getTotalDocentes();
  if(this.getTotalGeneros() !== totalDocentes){
    return false;
  }
  if( this.getTotalEdades() !== totalDocentes){
    return false;
  }
  return true;
}
}
