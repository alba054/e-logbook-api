import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostSessionTypePayload } from "../utils/interfaces/SessionType";

export class SessionType {
  async insertSessionType(payload: IPostSessionTypePayload) {
    try {
      return db.sessionType.create({
        data: {
          name: payload.name,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new session type");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getSessionTypes() {
    return db.sessionType.findMany();
  }
}
