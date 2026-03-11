import { UseCasePromise } from "app/application/base/use-case-promise.base";
import { SurveyDataInfo } from "app/domain/survey/survey.model";


export abstract class GetSurveyDataQuery implements UseCasePromise<SurveyDataInfo,any>{
  abstract execute(params:SurveyDataInfo): Promise<any>;
}
