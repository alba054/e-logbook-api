import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";

export class Day {
  async insertDay(id: string, day: string, weekId: string) {
    try {
      return db.day.create({
        data: {
          day,
          id,
          weekId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new unit");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
