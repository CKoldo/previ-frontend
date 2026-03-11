import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemporalSaveService {

  constructor() {
      console.log('[TemporalSaveService] Instancia creada');
  }

  private tempDataSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private tempDataQuestionSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private stageSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private isInitialized: boolean = false;
  private isLoadingSubject: BehaviorSubject<string> = new BehaviorSubject<string>("true"); // Usar BehaviorSubject para emitir valores iniciales y cambios
  isLoading$ = this.isLoadingSubject.asObservable();

  private dataInformationImplementationSubject = new BehaviorSubject<any>(null);
  dataInformationImplementation$ = this.dataInformationImplementationSubject.asObservable();

  private tempDataNoTarea= new BehaviorSubject<boolean>(true);
  public dataNoTarea$ = this.tempDataNoTarea.asObservable();


  init(initialData: any){
    if (!this.isInitialized) {
      const storedData = this.loadDataFromLocalStorage();
      if (storedData) {
        this.tempDataSubject.next(storedData);
      } else {
          this.tempDataSubject.next(initialData);
        this.saveDataToLocalStorage(initialData);
      }
      this.isInitialized = true; // Marcamos como inicializado
      return;
    }
  }

  saveData(data: any): void {
    if (!data.stage || !data.phase) {
      throw new Error('Both stage and phase must be provided.');
    }

    const currentData = this.tempDataSubject.value || [];

    const existingDataIndex = currentData.findIndex((item: any) => item.stage === data.stage && item.phase === data.phase);
    if (existingDataIndex === -1) {
      currentData.push(data);
    }
    else {
      currentData[existingDataIndex].questions = data.questions;
    }

    this.tempDataSubject.next(currentData);
    this.saveDataToLocalStorage(currentData);
  }

  isDataSaved(): boolean {
    return this.tempDataSubject.value !== null;
  }

  getData(): Observable<any> {
    return this.tempDataSubject.asObservable();
  }

  clearData(): void {
    this.tempDataSubject.next(null);
  }

  isDataInitialized(): boolean {
    return this.isInitialized;
  }

  // Método para cargar los datos desde localStorage
  private loadDataFromLocalStorage(): any {
    const data = localStorage.getItem('appData');
    return data ? JSON.parse(data) : null;  // Si hay datos en localStorage, los cargamos
  }

  // Método para guardar los datos en localStorage
  private saveDataToLocalStorage(data: any): void {
    localStorage.setItem('appData', JSON.stringify(data));  // Guardar los datos en formato JSON
  }

  saveCurrentQuestionTemp(data: any): void {
    localStorage.setItem('currentSurvey', JSON.stringify(data));
    this.tempDataQuestionSubject.next(data);
  }

  getCurrentQuestionTemp(): Observable<any> {
    let data = localStorage.getItem('currentSurvey');
    data = data ? JSON.parse(data) : null;
    this.tempDataQuestionSubject.next(data);
    return this.tempDataQuestionSubject.asObservable();
  }

  setDataInformationImplementation(data: any) {

    localStorage.setItem('dataInformationImplementation', JSON.stringify(data));
    this.dataInformationImplementationSubject.next(data); // Emite nuevos valores
  }

  getDataInformationImplementation():  Observable<any> {
    let data = localStorage.getItem('dataInformationImplementation');
     data = data ? JSON.parse(data) : null;
    this.dataInformationImplementationSubject.next(data);
     return this.dataInformationImplementationSubject.asObservable();
  }


  getStage(): Observable<any> {
    let data = localStorage.getItem('stage');
    data = data ? JSON.parse(data) : null;
   this.stageSubject.next(data);
    return this.stageSubject.asObservable();
  }

    emitChangeStatusTarea(data: any) {
      console.log('[Servicio] Emitiendo cambio de estado de tarea:', data);
    this.tempDataNoTarea.next(data);
  }

}
