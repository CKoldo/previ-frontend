import { UseCasePromise } from "app/application/base/use-case-promise.base";
import { ScheduleDateEntry } from "app/domain/survey/survey.model";

export abstract class GetScheduleDatesQuery implements UseCasePromise<void, ScheduleDateEntry[]>{
  abstract execute(): Promise<ScheduleDateEntry[]>;
}
