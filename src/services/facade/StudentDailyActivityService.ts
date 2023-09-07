import db from "../../database";
import { v4 as uuidv4 } from "uuid";
import { DailyActivity } from "../../models/DailyActivity";

export class StudentDailyActivityService {
  private dailyActivityModel: DailyActivity;

  constructor() {
    this.dailyActivityModel = new DailyActivity();
  }

  // !unused the flow has changed
  /*
  async generateDailyActivity(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    const studentDailyActivity =
      await this.dailyActivityModel.getDailyActivitiesByStudentIdAndUnitId(
        studentId,
        unitId
      );

    if (!studentDailyActivity.length) {
      for (let i = 0; i < 10; i++) {
        const dailyActivityId = uuidv4();
        db.$transaction([
          db.dailyActivity.create({
            data: {
              id: dailyActivityId,
              weekNum: i + 1,
              studentId,
              unitId,
            },
          }),
          db.weekAssesment.create({
            data: {
              id: uuidv4(),
              score: 0,
              weekNum: i + 1,
              studentId,
              unitId,
            },
          }),
          db.activity.createMany({
            data: [
              {
                day: "MONDAY",
                id: uuidv4(),
                dailyActivityId,
              },
              {
                day: "TUESDAY",
                id: uuidv4(),
                dailyActivityId,
              },
              {
                day: "WEDNESDAY",
                id: uuidv4(),
                dailyActivityId,
              },
              {
                day: "THURSDAY",
                id: uuidv4(),
                dailyActivityId,
              },
              {
                day: "FRIDAY",
                id: uuidv4(),
                dailyActivityId,
              },
            ],
          }),
        ]);
      }
    }
  }
  */
}
