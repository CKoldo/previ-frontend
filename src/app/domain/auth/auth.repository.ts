import { SignIn, SignInDREUGEL, UserData, UserTrack } from "./sign-in.model";
import { Token } from "./token.model";

export abstract class IAuthRepository {
  abstract getToken(): Promise<Token>;
  abstract signIn(params:SignIn): Promise<UserData>;
  abstract getUserTracking(params:SignInDREUGEL) : Promise<UserTrack>;
  abstract getMineduData(params: any): any;
}
