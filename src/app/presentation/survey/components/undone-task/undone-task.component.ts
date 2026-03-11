import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-undone-task',
  imports: [FormsModule,CommonModule,InputTextModule],
  templateUrl: './undone-task.component.html',
  styleUrl: './undone-task.component.css'
})
export class UndoneTaskComponent {
  comentario: string="";
  @Output() validation= new EventEmitter<boolean>();

  @Input() dataEntry: any=null;
  @Input() isCompletePhase :boolean= false;
  @Input() isUpdateEnable: boolean = false;

  ngOnInit() {
    if (this.dataEntry) {
      this.comentario = this.dataEntry?.comentario || '';
    }
  }

  getDataSave(){
    return {
      comentario: this.comentario,
      archivoActa:"",
      archivoFoto:""
    };
  }

  validateDataSave(){
    return this.comentario.trim();
  }

  isDisabled() {
    return this.isCompletePhase && !this.isUpdateEnable
  }
}
