import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { IPostExaminationTypePayload } from "../utils/interfaces/ExaminationType";
import { createErrorObject } from "../utils";

export class ExaminationType {
  constructor() {}

  async deleteExaminationType(id: string) {
    try {
      return db.examinationType.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete new examination type");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertExaminationTypeByUnitId(
    id: string,
    payload: IPostExaminationTypePayload
  ) {
    try {
      return db.examinationType.create({
        data: {
          id,
          typeName: payload.typeName,
          unitId: payload.unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new examination types");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getExaminationTypesByUnitId(unitId: string) {
    return db.examinationType.findMany({
      where: {
        unitId,
      },
    });
  }
}
