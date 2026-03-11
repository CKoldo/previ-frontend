import { UseCasePromise } from "app/application/base/use-case-promise.base";
import { ReportEntryData } from "app/domain/survey/survey.model";


export abstract class GenerateReportCommand implements UseCasePromise<ReportEntryData,any>{
  abstract execute(params:ReportEntryData): Promise<any>;
}
