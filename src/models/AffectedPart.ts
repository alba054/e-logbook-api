import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { IPostAffectedPartPayload } from "../utils/interfaces/AffectedPart";
import { createErrorObject } from "../utils";

export class AffectedPart {
  constructor() {}

  async deleteAffectedPart(id: string) {
    try {
      return db.affectedPart.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete new affected part");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertAffectedPartByUnitId(
    id: string,
    payload: IPostAffectedPartPayload
  ) {
    try {
      return db.affectedPart.create({
        data: {
          id,
          partName: payload.partName,
          unitId: payload.unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new affected parts");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getAffectedPartsByUnitId(unitId: string) {
    return db.affectedPart.findMany({
      where: {
        unitId,
      },
    });
  }
}
