import { Week } from "../../models/Week";
import { IPostWeek } from "../../utils/interfaces/Week";
import { v4 as uuidv4 } from "uuid";
import { createErrorObject, generateDay } from "../../utils";
import { Day } from "../../models/Day";
import db from "../../database";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class WeekService {
  private weekModel: Week;
  private dayModel: Day;

  constructor() {
    this.weekModel = new Week();
    this.dayModel = new Day();
  }

  async insertWeek(payload: IPostWeek) {
    const weekId = uuidv4();

    try {
      const generatedDays = generateDay(payload.startDate, payload.endDate);

      return db.$transaction([
        db.week.create({
          data: {
            endDate: payload.endDate,
            startDate: payload.startDate,
            weekNum: payload.weekNum,
            unitId: payload.unitId,
            id: weekId,
          },
        }),
        ...generatedDays.map((d) => {
          return db.day.create({
            data: {
              day: d,
              id: uuidv4(),
              weekId,
            },
          });
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new week");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
