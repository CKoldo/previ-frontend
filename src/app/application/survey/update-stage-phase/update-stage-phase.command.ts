import { UseCasePromise } from "app/application/base/use-case-promise.base";
import { SurveyData } from "app/domain/survey/survey.model";

export abstract class UpdateStagePhaseCommand implements UseCasePromise<SurveyData,any>{
  abstract execute(params:SurveyData): Promise<any>;
}
