import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { IPostManagementTypePayload } from "../utils/interfaces/ManagementType";
import { createErrorObject } from "../utils";

export class ManagementType {
  constructor() {}

  async insertManagementTypeByUnitId(
    id: string,
    payload: IPostManagementTypePayload
  ) {
    try {
      return db.managementType.create({
        data: {
          id,
          typeName: payload.typeName,
          unitId: payload.unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new Management types");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getManagementTypesByUnitId(unitId: string) {
    return db.managementType.findMany({
      where: {
        unitId,
      },
    });
  }
}
