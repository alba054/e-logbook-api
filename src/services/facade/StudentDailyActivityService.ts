import db from "../../database";
import { v4 as uuidv4 } from "uuid";

export class StudentDailyActivityService {
  constructor() {}

  async generateDailyActivity(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
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
