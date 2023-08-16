import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostCaseTypesPayload } from "../utils/interfaces/CaseTypes";

export class CaseTypes {
  async deleteCaseTypes(id: number) {
    try {
      return db.caseType.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete new case types");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertCaseTypesByUnitId(payload: IPostCaseTypesPayload) {
    try {
      return db.caseType.create({
        data: {
          name: payload.name,
          unitId: payload.unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new case types");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getCaseTypesByUnitId(unitId: string) {
    return db.caseType.findMany({
      where: {
        unitId,
      },
    });
  }
}
