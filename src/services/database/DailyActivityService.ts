import { DailyActivity } from "../../models/DailyActivity";
import { createErrorObject } from "../../utils";
import { IPutDailyActivityActivity } from "../../utils/interfaces/DailyActivity";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";

export class DailyActivityService {
  private dailyActivityModel: DailyActivity;
  private studentService: StudentService;

  constructor() {
    this.dailyActivityModel = new DailyActivity();
    this.studentService = new StudentService();
  }

  async getDailyActivitiesByStudentIdAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const dailyActivities =
      await this.dailyActivityModel.getDailyActivitiesByStudentIdAndUnitId(
        tokenPayload.studentId,
        activeUnit?.activeUnit.activeUnit?.id
      );

    return dailyActivities;
  }

  async editDailyActivityActivity(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutDailyActivityActivity
  ) {
    const dailyActivityActivity =
      await this.dailyActivityModel.getDailyActivityActivityById(id);

    if (!dailyActivityActivity) {
      return createErrorObject(404, "activity's not found");
    }

    if (
      dailyActivityActivity?.DailyActivity?.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "activity's not for you");
    }

    return this.dailyActivityModel.editDailyActivityActivityById(id, payload);
  }

  async getActivitiesByDailyActivityId(
    tokenPayload: ITokenPayload,
    id: string
  ) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const dailyActivity = await this.dailyActivityModel.getDailyActivityById(
      id
    );

    if (!dailyActivity) {
      return createErrorObject(404, "daily activity's not found");
    }

    if (dailyActivity.studentId !== tokenPayload.studentId) {
      return createErrorObject(400, "daily activity's not for you");
    }

    if (dailyActivity.unitId !== activeUnit?.activeUnit.activeUnit?.id) {
      return createErrorObject(400, "unit is not an active unit");
    }

    return dailyActivity;
  }
}
