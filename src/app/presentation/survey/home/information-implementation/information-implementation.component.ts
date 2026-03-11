import { TemporalSaveService } from './../../../../shared/services/temporal-save.service';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButton } from 'primeng/radiobutton';
import { DatePickerModule } from 'primeng/datepicker';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { firstValueFrom, Subject, take, takeUntil } from 'rxjs';

@Component({
  selector: 'app-information-implementation',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DropdownModule,
    InputTextModule,
    RadioButton,
    DatePickerModule,
    ToggleSwitchModule,
  ],
  providers: [],
  templateUrl: './information-implementation.component.html',
  styleUrl: './information-implementation.component.css',
})
export class InformationImplementationComponent {
  q4!: string;
  @Input() selectedStage: number = 1;
  @Input() selectedPhase: number = 1;
  @Input() isAllStagesCompleted: boolean = false;
  fechaModalidad: Date = new Date();
  modality: boolean = true;
  nombreImplementacion: string = '';
  tareaImplementada: boolean = true;
  extraInfo: string = '';

  es: any;

  private destroy$ = new Subject<void>(); // Subject para manejar el ciclo de vida de las suscripciones

  isPhaseCompleted: boolean = false; // Variable para controlar el estado de la fase

  constructor(private _TemporalSaveService: TemporalSaveService) {}

  ngAfterViewInit() {
    this.subscribeToDataChanges();
    this.isAllStagesCompleted = false;
  }

  ngOnDestroy() {
    this.destroy$.next(); // Emite un valor para finalizar las suscripciones
    this.destroy$.complete(); // Completa el Subject
  }

  private async subscribeToDataChanges() {
    try {
      const data = await firstValueFrom(
        this._TemporalSaveService.getDataInformationImplementation(),
      );
      if (data) {
        this.tareaImplementada = data?.tareaImplementada ?? true;

        if (data?.fechaModalidad) {
          this.fechaModalidad = this.convertToDate(
            data.fechaModalidad.split('T')[0],
          );
        }

        this.modality = data.modalidad;
        if (this.selectedPhase === 5) {
          if (data?.nombreImplementacion) {
            this.nombreImplementacion = data?.nombreImplementacion;
          }
        }
        this.isPhaseCompleted = true;
      } else {
        this.setDataInitial(); // Solo establece valores iniciales si no hay datos
        this.setDataInformationImplementation(); // Guarda los datos iniciales
      }
    } catch (error) {
      console.error('Error al obtener los datos:', error);
    }
  }

  async setDataInitial() {
    this.fechaModalidad = new Date();
    this.nombreImplementacion = '';
    this.modality = true;
  }

  convertToDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  async setDataInformationImplementation() {
    const dataToSave: any = {
      fechaModalidad: this.fechaModalidad.toISOString().split('T')[0],
      modalidad: this.modality,
      tareaImplementada: this.tareaImplementada,
    };

    // if(this.esTareaNoImplementada && this.extraInfo && this.extraInfo.trim() &&this.extraInfo.length > 0) {
    //   dataToSave["extraInfo"] = this.extraInfo.trim();
    // }

    if (this.selectedPhase === 5) {
      dataToSave['nombreImplementacion'] = this.nombreImplementacion;
    }

    try {
      await this._TemporalSaveService.setDataInformationImplementation(
        dataToSave,
      );
      this._TemporalSaveService.emitChangeStatusTarea(this.tareaImplementada);
      //console.log('Datos guardados exitosamente:', dataToSave);
    } catch (error) {
      console.error('Error al guardar los datos de inf implementacion:', error);
    }
  }
}
