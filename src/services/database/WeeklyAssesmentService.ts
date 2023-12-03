import { WeeklyAssesment } from "../../models/WeeklyAssesment";
import { IPutWeeklyAssesmentScore } from "../../utils/interfaces/WeeklyAssesment";
import db from "../../database";
import { History } from "../../models/History";
import { getUnixTimestamp } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";

export class WeeklyAssesmentService {
  private weeklyAssesmentModel: WeeklyAssesment;
  private historyModel: History;

  constructor() {
    this.weeklyAssesmentModel = new WeeklyAssesment();
    this.historyModel = new History();
  }

  async getWeeklyAssesmentByStudentIdAndUnitIdAndWeekId(
    studentId: string | null | undefined,
    unitId: string | null | undefined,
    weekId: string | undefined
  ) {
    return this.weeklyAssesmentModel.getWeeklyAssesmentByStudentIdAndUnitIdAndWeekId(
      studentId,
      unitId,
      weekId
    );
  }

  async verifyWeeklyAssesmentByStudentIdAndUnitId(
    studentId: string,
    unitId: string
  ) {
    return this.weeklyAssesmentModel.verifyWeeklyAssesmentByStudentIdAndUnitId(
      studentId,
      unitId
    );
  }

  async scoreWeelyAssesmentById(
    id: string,
    payload: IPutWeeklyAssesmentScore,
    tokenPayload: ITokenPayload
  ) {
    // return this.weeklyAssesmentModel.updateScoreById(id, payload);
    const selected = await this.weeklyAssesmentModel.getWeeklyAssesmentById(id);
    return db.$transaction([
      db.weekAssesment.update({
        where: {
          id,
        },
        data: {
          score: payload.score,
          verificationStatus: "VERIFIED",
        },
      }),
      this.historyModel.insertHistoryAsync(
        "WEEKLY_ASSESMENT",
        getUnixTimestamp(),
        selected?.studentId ?? "",
        tokenPayload.supervisorId,
        id,
        selected?.unitId ?? ""
      ),
    ]);
  }

  async getWeeklyAssesmentByStudentIdAndUnitId(
    studentId: string,
    unitId: string
  ) {
    return this.weeklyAssesmentModel.getWeeklyAssesmentByStudentIdAndUnitId(
      studentId,
      unitId
    );
  }
}
