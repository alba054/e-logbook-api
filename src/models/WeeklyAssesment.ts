import db from "../database";
import { IPutWeeklyAssesmentScore } from "../utils/interfaces/WeeklyAssesment";

export class WeeklyAssesment {
  async getWeeklyAssesmentByStudentIdAndUnitIdAndWeekNum(
    studentId: string | null | undefined,
    unitId: string | null | undefined,
    weekNum: number | undefined
  ) {
    return db.weekAssesment.findFirst({
      where: {
        unitId,
        studentId,
        weekNum,
      },
    });
  }

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

   async getWeeklyAssesmentById(
    id: string
  ) {
    return db.weekAssesment.findFirst({
      where: {
        id
      },
    });
  }

  async updateScoreById(id: string, payload: IPutWeeklyAssesmentScore) {
    return (
     await  db.$transaction([
        db.weekAssesment.update({
          where: {
            id,
          },
          data: {
            score: payload.score,
            verificationStatus: "VERIFIED",
            },
          }
        ),
      ])
    )[0];
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
