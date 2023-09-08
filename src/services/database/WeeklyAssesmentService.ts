import { WeeklyAssesment } from "../../models/WeeklyAssesment";
import { IPutWeeklyAssesmentScore } from "../../utils/interfaces/WeeklyAssesment";

export class WeeklyAssesmentService {
  private weeklyAssesmentModel: WeeklyAssesment;

  constructor() {
    this.weeklyAssesmentModel = new WeeklyAssesment();
  }

  async getWeeklyAssesmentByStudentIdAndUnitIdAndWeekNum(
    studentId: string | null | undefined,
    unitId: string | null | undefined,
    weekNum: number | undefined
  ) {
    return this.weeklyAssesmentModel.getWeeklyAssesmentByStudentIdAndUnitIdAndWeekNum(
      studentId,
      unitId,
      weekNum
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

  async scoreWeelyAssesmentById(id: string, payload: IPutWeeklyAssesmentScore) {
    return this.weeklyAssesmentModel.updateScoreById(id, payload);
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
