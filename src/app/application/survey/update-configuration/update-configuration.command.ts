import { UseCasePromise } from "app/application/base/use-case-promise.base";
import { SurveyConfiguration } from "app/domain/survey/survey.model";


export abstract class UpdateConfigurationCommand implements UseCasePromise<SurveyConfiguration,any>{
  abstract execute(params:SurveyConfiguration): Promise<any>;
}
