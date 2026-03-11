import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Phase1Component } from './components/phase-1/phase-1.component';
import { Phase2Component } from './components/phase-2/phase-2.component';
import { Phase3Component } from './components/phase-3/phase-3.component';
//import { Phase4Component } from './components/phase-4/phase-4.component';
//import { Phase5Component } from './components/phase-5/phase-5.component';

@Component({
  selector: 'app-stage-4',
  imports: [CommonModule,Phase1Component,Phase2Component,Phase3Component],
  templateUrl: './stage-4.component.html',
  styleUrls: ['./stage-4.component.css']
})
export class Stage4Component {
 @Input() question:number=1;
 @Input() phase:number=1;
 @Output() isLoading = new EventEmitter<boolean>(); // Define the @Output property
 selectedStage:number=1;  
 @Input() isAllStagesCompleted:boolean=false;

 // Example method to emit loading state
 setLoadingState(isLoading: any) {
   this.isLoading.emit(isLoading); // Emit the loading state
 }
}
