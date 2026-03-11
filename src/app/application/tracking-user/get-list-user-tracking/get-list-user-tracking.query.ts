import { UseCasePromise } from "app/application/base/use-case-promise.base";

export abstract class GetListUserTrackingQuery implements UseCasePromise<any, any> {
  abstract execute(): Promise<any>;
}
