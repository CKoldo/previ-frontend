import { UseCasePromise } from 'app/application/base/use-case-promise.base';
import { StageStatusUpdate } from 'app/domain/survey/survey.model';

export abstract class UpdateStageStatusCommand
  implements UseCasePromise<StageStatusUpdate, any>
{
  abstract execute(params: StageStatusUpdate): Promise<any>;
}
