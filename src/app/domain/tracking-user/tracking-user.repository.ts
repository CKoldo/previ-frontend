import { TrackingUserData } from "./tracking-user.model";

export abstract class ITrackingUserRepository {
  abstract getListUserTracking(): Promise<any>;
  abstract saveUserTracking(params: TrackingUserData): Promise<any>;
  abstract getPhaseFiles(localCode: string): Promise<any>;
}
