import { SignIn, UserData } from "../../../domain/auth/sign-in.model";
import { UseCasePromise } from "../../base/use-case-promise.base";


export abstract class SignInCommand implements UseCasePromise<SignIn,any>{
  abstract execute(params:SignIn): Promise<UserData>;
}
