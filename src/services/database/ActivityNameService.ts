import { ActivityName } from "../../models/ActivityName";
import { IPostActivityNamePayload } from "../../utils/interfaces/ActivityName";

export class ActivityNameService {
  private activityNameModel: ActivityName;

  constructor() {
    this.activityNameModel = new ActivityName();
  }

  async deleteActivityNameById(id: number) {
    return this.activityNameModel.deleteActivityName(id);
  }

  async insertActivityNamesUnit(payload: IPostActivityNamePayload) {
    return this.activityNameModel.insertActivityNameByUnitId(payload);
  }

  async getActivityNameByUnitId() {
    return this.activityNameModel.getActivityNamesByUnitId();
  }
}
