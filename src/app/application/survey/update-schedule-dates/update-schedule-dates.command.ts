import { UseCasePromise } from "app/application/base/use-case-promise.base";
import { ScheduleDateUpdate } from "app/domain/survey/survey.model";

export abstract class UpdateScheduleDatesCommand implements UseCasePromise<ScheduleDateUpdate, any> {
  abstract execute(params: ScheduleDateUpdate): Promise<any>;
}
