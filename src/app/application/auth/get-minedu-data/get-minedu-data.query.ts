import { UseCasePromise } from "app/application/base/use-case-promise.base";

export abstract class GetMineduDataQuery implements UseCasePromise<any,any>{
  abstract execute(params:any): Promise<any>;
}
