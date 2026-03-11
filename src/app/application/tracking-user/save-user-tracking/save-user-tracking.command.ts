import { UseCasePromise } from "app/application/base/use-case-promise.base";
import { TrackingUserData } from "app/domain/tracking-user/tracking-user.model";

export abstract class SaveUserTrackingCommand implements UseCasePromise<TrackingUserData, any> {
  abstract execute(params: TrackingUserData): Promise<any>;
}
