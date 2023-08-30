import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import {
  IPostSelfReflection,
  IPutSelfReflection,
  IPutSelfReflectionVerificationStatus,
} from "../utils/interfaces/SelfReflection";
import { History } from "./History";

export class SelfReflection {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async updateSelfReflectionById(id: string, payload: IPutSelfReflection) {
    return db.selfReflection.update({
      where: {
        id,
      },
      data: {
        content: payload.content,
      },
    });
  }

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
      return (
        await db.$transaction([
          db.selfReflection.create({
            data: {
              content: payload.content,
              id,
              studentId,
              unitId,
            },
          }),
          this.historyModel.insertHistoryAsync(
            "SELF_REFLECTION",
            getUnixTimestamp(),
            studentId,
            undefined,
            id,
            unitId
          ),
        ])
      )[0];
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert self reflection");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
