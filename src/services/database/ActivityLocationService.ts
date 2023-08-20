import { ActivityLocation } from "../../models/ActivityLocation";
import { IPostActivityLocationPayload } from "../../utils/interfaces/ActivityLocation";

export class ActivityLocationService {
  private activityLocationModel: ActivityLocation;

  constructor() {
    this.activityLocationModel = new ActivityLocation();
  }

  async deleteActivityLocationById(id: number) {
    return this.activityLocationModel.deleteActivityLocation(id);
  }

  async insertActivityLocationsUnit(payload: IPostActivityLocationPayload) {
    return this.activityLocationModel.insertActivityLocationByUnitId(payload);
  }

  async getActivityLocationByUnitId() {
    return this.activityLocationModel.getActivityLocationsByUnitId();
  }
}
