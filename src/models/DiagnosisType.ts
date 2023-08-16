import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { IPostDiagnosisTypePayload } from "../utils/interfaces/DiagnosisType";
import { createErrorObject } from "../utils";

export class DiagnosisType {
  constructor() {}

  async deleteDiagnosisType(id: string) {
    try {
      return db.diagnosisType.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete new diagnosis type");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertDiagnosisTypeByUnitId(
    id: string,
    payload: IPostDiagnosisTypePayload
  ) {
    try {
      return db.diagnosisType.create({
        data: {
          id,
          typeName: payload.typeName,
          unitId: payload.unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new Diagnosis types");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getDiagnosisTypesByUnitId(unitId: string) {
    return db.diagnosisType.findMany({
      where: {
        unitId,
      },
    });
  }
}
