import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostScientificRolePayload } from "../utils/interfaces/ScientificRole";

export class ScientificRole {
  async insertScientificRole(payload: IPostScientificRolePayload) {
    try {
      return db.scientificRole.create({
        data: {
          name: payload.name,
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

  async getScientificRoles() {
    return db.scientificRole.findMany();
  }
}
