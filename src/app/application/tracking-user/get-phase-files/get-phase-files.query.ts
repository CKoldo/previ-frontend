import { UseCasePromise } from "app/application/base/use-case-promise.base";

export abstract class GetPhaseFilesQuery implements UseCasePromise<string, any>{
   abstract execute(localCode: string): Promise<any>;
}
