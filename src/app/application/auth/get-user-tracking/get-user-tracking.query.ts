import { SignIn, SignInDREUGEL, UserData, UserTrack } from "../../../domain/auth/sign-in.model";
import { UseCasePromise } from "../../base/use-case-promise.base";


export abstract class GetUserTrackingQuery implements UseCasePromise<SignInDREUGEL,any>{
  abstract execute(params:SignInDREUGEL): Promise<UserTrack>;
}
