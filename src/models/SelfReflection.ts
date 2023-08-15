import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import {
  IPostSelfReflection,
  IPutSelfReflectionVerificationStatus,
} from "../utils/interfaces/SelfReflection";

export class SelfReflection {
  async getSelfReflectionsById(id: string) {
    return db.selfReflection.findUnique({
      where: {
        id,
      },
      include: {
        Student: true,
      },
    });
  }

  async getSelfReflectionsBySupervisorAndStudentId(
    supervisorId: string | undefined,
    studentId: string
  ) {
    return db.selfReflection.findMany({
      where: {
        Student: {
          OR: [
            {
              academicSupervisorId: supervisorId,
            },
            {
              supervisingSupervisorId: supervisorId,
            },
            {
              examinerSupervisorId: supervisorId,
            },
          ],
          studentId,
        },
      },
    });
  }

  async getSelfReflectionsBySupervisor(supervisorId?: string) {
    return db.selfReflection.findMany({
      where: {
        Student: {
          OR: [
            {
              academicSupervisorId: supervisorId,
            },
            {
              supervisingSupervisorId: supervisorId,
            },
            {
              examinerSupervisorId: supervisorId,
            },
          ],
        },
        verificationStatus: "INPROCESS",
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["studentId"],
      include: {
        Student: true,
      },
    });
  }

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
