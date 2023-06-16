import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostUnit } from "../utils/interfaces/Unit";

export class Unit {
  constructor() {}

  async insertNewUnit(id: string, payload: IPostUnit) {
    try {
      return db.unit.create({
        data: { id, name: payload.name },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new unit");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getAllUnits() {
    return db.unit.findMany({});
  }
}
