import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostActivityNamePayload } from "../utils/interfaces/ActivityName";

export class ActivityName {
  constructor() {}

  async deleteActivityName(id: number) {
    try {
      return db.activityName.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete new activity Name");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertActivityNameByUnitId(payload: IPostActivityNamePayload) {
    try {
      return db.activityName.create({
        data: {
          name: payload.name,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new activity Name");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getActivityNamesByUnitId() {
    return db.activityName.findMany();
  }
}
