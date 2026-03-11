import { Injectable } from '@angular/core';
import { ISurveyRepository } from 'app/domain/survey/survey.repository';
import { StageStatusUpdate } from 'app/domain/survey/survey.model';
import { UpdateStageStatusCommand } from './update-stage-status.command';

@Injectable({ providedIn: 'root' })
export class UpdateStageStatusHandler implements UpdateStageStatusCommand {
  constructor(private readonly _surveyRepository: ISurveyRepository) {}

  execute(params: StageStatusUpdate): Promise<any> {
    return this._surveyRepository.updateStageStatus(params);
  }
}
