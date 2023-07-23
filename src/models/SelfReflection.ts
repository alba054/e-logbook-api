import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostSelfReflection } from "../utils/interfaces/SelfReflection";

export class SelfReflection {
  async getSelfReflectionsByStudentIdAndUnitId(
    studentId?: string,
    unitId?: string
  ) {
    return db.selfReflection.findMany({
      where: {
        studentId,
        unitId,
      },
      include: {
        Student: true,
      },
    });
  }

  async insertSelfReflection(
    id: string,
    payload: IPostSelfReflection,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return db.selfReflection.create({
        data: {
          content: payload.content,
          id,
          studentId,
          unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert self reflection");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
