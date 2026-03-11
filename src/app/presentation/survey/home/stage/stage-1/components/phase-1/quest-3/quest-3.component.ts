import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-phase-1-quest-3',
  imports: [FormsModule, CommonModule,DropdownModule,InputNumberModule],
  templateUrl: './quest-3.component.html',
  styleUrl: './quest-3.component.css'
})
export class Quest3Component {
  @Input() dataEntry: any=null;
  @Input() isCompletePhase :any= false;
  @Input() isUpdateEnable: boolean = false;
  docentes = [
    {
      label: "Nivel Primaria",
      niveles: [
        {
          label: "5to grado",
          cantidad:0
        },
        {
          label: "6to grado",
          cantidad:0
        }
      ]
    },
    {
      label: "Nivel Secundaria",
      niveles: [
        {
          label: "1er grado",
          cantidad:0
        },
        {
          label: "2do grado",
          cantidad:0
        },
        {
          label: "3er grado",
          cantidad:0
        },
        {
          label: "4to grado",
          cantidad:0
        },
        {
          label: "5to grado",
          cantidad:0
        }
      ]
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
  ];

  isGenerosInvalid: boolean = false;

  ngOnInit() {
    if(this.dataEntry){
      this.docentes = this.dataEntry.docentes;
      this.generos = this.dataEntry.generos;
    }
  }

  getTotalDocentes(): number {
    return this.docentes.reduce((total, docente) =>
      total + docente.niveles.reduce((sum, nivel) =>
        sum + ((nivel.cantidad * 1) || 0), 0), 0);
  }

  getTotalGeneros(): number {
    return this.generos.reduce((sum, genero) =>
      sum + ((genero.cantidad * 1) || 0), 0);
  }


  validateTotals() {
    const totalDocentes = this.getTotalDocentes();
    this.isGenerosInvalid = this.getTotalGeneros() !== totalDocentes;
  }

  changeCantidadDocentes() {
    this.validateTotals();
  }

  changeCantidadGeneros() {
    this.validateTotals();
  }

  getDataSave(){
    return {
      docentes: this.docentes,
      generos: this.generos
    };
  }

  validateDataSave(){
    const totalDocentes = this.getTotalDocentes();
    if(this.getTotalGeneros() !== totalDocentes){
      return false;
    }
    return true;
  }
}
