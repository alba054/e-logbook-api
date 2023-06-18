import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { IPutStudentActiveUnit } from "../utils/interfaces/Student";
import { createErrorObject } from "../utils";

export class Student {
  constructor() {}

  async updateStudentActiveUnitByStudentId(
    studentId: string,
    payload: IPutStudentActiveUnit
  ) {
    try {
      return db.student.update({
        where: {
          studentId,
        },
        data: {
          unitId: payload.unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update activeUnit");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
