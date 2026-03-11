import { ReportEntryData, ScheduleDateUpdate, StageStatusUpdate, SurveyConfiguration, SurveyData, SurveyDataInfo } from "./survey.model";

export abstract class ISurveyRepository {
  abstract saveStagePhase(params:SurveyData): Promise<any>;
  abstract getScheduleDates(): Promise<any>;
  abstract updateScheduleDates(params: ScheduleDateUpdate): Promise<any>;
  abstract updateStageStatus(params: StageStatusUpdate): Promise<any>;
  abstract saveConfiguration(params:SurveyConfiguration): Promise<any>;
  abstract updateStagePhase(params:SurveyData): Promise<any>;
  abstract updateConfiguration(params:SurveyConfiguration): Promise<any>;
  abstract getSurveyData(params:SurveyDataInfo): Promise<any>;
  abstract generateReport(params: ReportEntryData): Promise<any>;

}
