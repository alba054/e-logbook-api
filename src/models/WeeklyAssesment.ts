import db from "../database";
import { IPutWeeklyAssesmentScore } from "../utils/interfaces/WeeklyAssesment";

export class WeeklyAssesment {
  async verifyWeeklyAssesmentByStudentIdAndUnitId(
    studentId: string,
    unitId: string
  ) {
    return db.weekAssesment.updateMany({
      where: {
        Student: {
          studentId,
        },
        unitId,
      },
      data: {
        verificationStatus: "VERIFIED",
      },
    });
  }

  async updateScoreById(id: string, payload: IPutWeeklyAssesmentScore) {
    return db.weekAssesment.update({
      where: {
        id,
      },
      data: {
        score: payload.score,
        verificationStatus: "VERIFIED",
      },
    });
  }

  async getWeeklyAssesmentByStudentIdAndUnitId(
    studentId: string,
    unitId: string
  ) {
    return db.weekAssesment.findMany({
      where: {
        Student: {
          studentId,
        },
        unitId,
      },
      include: {
        Student: true,
        Unit: true,
      },
      orderBy: {
        weekNum: "asc",
      },
    });
  }
}
