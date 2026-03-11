import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';


@Component({
  selector: 'app-phase-1-quest-4',
  imports: [FormsModule, CommonModule,DropdownModule,InputNumberModule],
  templateUrl: './quest-4.component.html',
  styleUrl: './quest-4.component.css'
})
export class Quest4Component {
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
      this.docentes=this.dataEntry.docentes;
      this.generos=this.dataEntry.generos;
      this.edades=this.dataEntry.edades;
    }
  }



  getTotalDocentes(): number {
    return this.docentes.reduce((sum, docente) =>
      sum + docente.niveles.reduce((nivelSum, nivel) =>
        nivelSum + ((nivel.cantidad * 1) || 0), 0), 0);
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
