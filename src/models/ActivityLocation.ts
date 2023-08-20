import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostActivityLocationPayload } from "../utils/interfaces/ActivityLocation";

export class ActivityLocation {
  constructor() {}

  async deleteActivityLocation(id: number) {
    try {
      return db.activityLocation.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete new activity location");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertActivityLocationByUnitId(payload: IPostActivityLocationPayload) {
    try {
      return db.activityLocation.create({
        data: {
          name: payload.name,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new activity location");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getActivityLocationsByUnitId() {
    return db.activityLocation.findMany();
  }
}
