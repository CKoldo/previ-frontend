import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comments',
  imports: [FormsModule,CommonModule,InputTextModule],
  templateUrl: './comments.component.html',
  styleUrl: './comments.component.css'
})
export class CommentsComponent {
  comentario!: string;
  archivoActa!: File;
  archivoFoto!: File;
  archivoActaName: string="";
  archivoFotoName: string="";
  @Output() validation= new EventEmitter<boolean>();

  @Input() dataEntry: any=null;
  @Input() archivoName: any=null;
  @Input() isCompletePhase :boolean= false;
  @Input() isUpdateEnable: boolean = false;
  @Input() selectedStage = 0;
  @Input() selectedPhase = 1;
  examActaName: string="";
  examFotoName: string="";

  ngOnInit() {


    if (this.dataEntry) {
      this.comentario = this.dataEntry.comentario || '';

    }
    if(this.archivoName){

      if(this.archivoName?.archivoActa?.file){
        this.archivoActaName= this.archivoName.archivoActa.name;

        let mimeType = this.archivoName.archivoActa.file.split(',')[0].split(':')[1].split(';')[0];
        let base64String = this.archivoName.archivoActa.file.split(',')[1]; // Remove the prefix
        let byteCharacters = atob(base64String);
        let byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        let byteArray = new Uint8Array(byteNumbers);
        this.archivoActa = new File([byteArray], this.archivoActaName, { type: mimeType });
        let fileInputActa = document.getElementById('archivoActaInput') as HTMLInputElement;
        if (fileInputActa) {
          let dataTransfer = new DataTransfer();
          dataTransfer.items.add(this.archivoActa);
          fileInputActa.files = dataTransfer.files;
        }
      }

      if(this.archivoName?.archivoFoto?.file){
        this.archivoFotoName= this.archivoName.archivoFoto.name;

        let mimeType = this.archivoName.archivoFoto.file.split(',')[0].split(':')[1].split(';')[0];
        let base64String = this.archivoName.archivoFoto.file.split(',')[1]; // Remove the prefix
        let byteCharacters = atob(base64String);
        let byteNumbers = new Array(byteCharacters.length).fill(0).map((_, i) => byteCharacters.charCodeAt(i));
        let byteArray = new Uint8Array(byteNumbers);
        this.archivoFoto = new File([byteArray], this.archivoFotoName, { type: mimeType });
        let fileInputFoto = document.getElementById('archivoFotoInput') as HTMLInputElement;
        if (fileInputFoto) {
          let dataTransfer = new DataTransfer();
          dataTransfer.items.add(this.archivoFoto);
          fileInputFoto.files = dataTransfer.files;
        }
      }
    }

    this.examActaName=`ACTA_201030_TA ${this.selectedStage}.${this.selectedPhase}_EICE_JUAN PEREZ`;
    this.examFotoName=`FOTO_201030_TA ${this.selectedStage}.${this.selectedPhase}_EICE_JUAN PEREZ`;
  }

  onArchivoActaChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validType = file.type === 'application/pdf';
      if (!validType) {
              Swal.fire({
                text: 'El acta debe ser un archivo PDF.',
                icon: 'warning',
              });
        event.target.value = '';
        this.archivoActa = undefined as any;
        this.emitValidationState();
        return;
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB
          Swal.fire({
                text: 'El archivo del acta no debe superar los 2MB.',
                icon: 'warning',
              });
        event.target.value = '';
        this.archivoActa = undefined as any;
        this.emitValidationState();
        return;
      }
      this.archivoActa = file;
      this.emitValidationState();
    }
  }

  onArchivoFotoChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
            Swal.fire({
                text: 'La foto debe ser un archivo JPEG, JPG o PNG.',
                icon: 'warning',
              });
        event.target.value = '';
        this.archivoFoto = undefined as any;
        this.emitValidationState();
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
          Swal.fire({
                text: 'La foto no debe superar los 2MB.',
                icon: 'warning',
              });
        event.target.value = '';
        this.archivoFoto = undefined as any;
        this.emitValidationState();
        return;
      }
      this.archivoFoto = file;
      this.emitValidationState();
    }
  }

  getDataSave(){
    return {
      comentario: this.comentario,
      archivoActa:this.archivoActa,
      archivoFoto:this.archivoFoto
    };
  }

  validateDataSave(){
    return this.archivoActa != null && this.archivoFoto != null;
  }

  private emitValidationState() {
    this.validation.emit(this.validateDataSave());
  }

  isDisabled() {
    return this.isCompletePhase && !this.isUpdateEnable
  }

  onDownloadArchivoActa() {
    if (this.archivoActa) {
      const url = URL.createObjectURL(this.archivoActa);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.archivoActa.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  onDownloadArchivoFoto() {
    if (this.archivoFoto) {
      const url = URL.createObjectURL(this.archivoFoto);
      const a = document.createElement('a');
      a.href = url;
      a.download = this.archivoFoto.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }
}
