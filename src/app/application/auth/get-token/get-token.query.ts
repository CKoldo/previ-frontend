import { UseCasePromise } from "app/application/base/use-case-promise.base";
import { Token } from "app/domain/auth/token.model";

export abstract class GetTokenQuery implements UseCasePromise<any,Token>{
  abstract execute(): Promise<Token>;
}
