import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostWeek } from "../utils/interfaces/Week";

export class Week {
  async insertWeek(id: string, payload: IPostWeek) {
    try {
      return db.week.create({
        data: {
          endDate: payload.endDate,
          startDate: payload.startDate,
          weekNum: payload.weekNum,
          unitId: payload.unitId,
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new week");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
