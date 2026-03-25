import { TemporalSaveService } from './../../../../shared/services/temporal-save.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { isSurveyEditMode } from 'app/shared/utils/survey-mode';

@Component({
  selector: 'app-buttons',
  imports: [CommonModule],
  providers: [],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.css'
})
export class ButtonsComponent {
  @Input() currentStep = 1;
  @Input() countQuestion = 0;
  @Input()selectedStage = 0;
  @Input()selectedPhase = 1;
  @Input() isDisabled :any= false;
  @Input() isCompletePhase :any= false;
  @Input() isUpdateEnable: boolean = false;

  @Output() nextStepEmit: any=new EventEmitter<number>();
  @Output() prevStepEmit: any=new EventEmitter<number>();
  @Output() finalStepEmit: any=new EventEmitter<number>();
    tareaImplementada: boolean = true;

  constructor(
    private router: Router,
    private _TemporalSaveService: TemporalSaveService
  ) {
  }

    ngOnInit() {
    this._TemporalSaveService.dataNoTarea$.subscribe((data) => {
      this.tareaImplementada = data;
    });
  }

  nextStep(){
    this.nextStepEmit.emit(this.currentStep);
  }
  previousStep() {
    this.prevStepEmit.emit(this.currentStep);
  }

  finalStep() {
    if(this.isCompletePhase){
      if(this.isUpdateEnable){
        this.finalStepEmit.emit(this.currentStep);
      }else{
        this.GoToSelectStage();
      }
    }else{
      this.finalStepEmit.emit(this.currentStep);
    }

  }
//se agrego
  GoToSelectStage() {
    if (isSurveyEditMode()) {
      const currentUrl = this.router.url;
      if (currentUrl.includes('/tracking-user')) {
        this._TemporalSaveService.requestClearTrackingUserSelection();
        return;
      }

      this._TemporalSaveService.requestGoBackToTracking();
      return;
    }

    this.router.navigate(['/']).then(() => {
      this.router.navigate(['/survey']);
    });
  }
}
