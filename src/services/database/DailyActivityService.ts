import { DailyActivity } from "../../models/DailyActivity";
import { createErrorObject } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";

export class DailyActivityService {
  private dailyActivityModel: DailyActivity;
  private studentService: StudentService;

  constructor() {
    this.dailyActivityModel = new DailyActivity();
    this.studentService = new StudentService();
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
