import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import {
  IPostProblemConsultation,
  IPutProblemConsultation,
} from "../utils/interfaces/ProblemConsultation";

export class ProblemConsultation {
  async updateProblemConsultationById(
    id: string,
    payload: IPutProblemConsultation
  ) {
    return db.problemConsultation.update({
      where: {
        id,
      },
      data: {
        problem: payload.content,
      },
    });
  }

  async getProblemConsultationsById(id: string) {
    return db.problemConsultation.findUnique({
      where: {
        id,
      },
      include: {
        Student: true,
      },
    });
  }

  async getProblemConsultationsBySupervisorAndStudentId(
    supervisorId: string | undefined,
    studentId: string
  ) {
    return db.problemConsultation.findMany({
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

  async getProblemConsultationsBySupervisor(supervisorId?: string) {
    return db.problemConsultation.findMany({
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

  async getProblemConsultationsByStudentIdAndUnitId(
    studentId?: string,
    unitId?: string
  ) {
    return db.problemConsultation.findMany({
      where: {
        studentId,
        unitId,
      },
      include: {
        Student: true,
      },
    });
  }

  async insertProblemConsultation(
    id: string,
    payload: IPostProblemConsultation,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return db.problemConsultation.create({
        data: {
          problem: payload.content,
          id,
          studentId,
          unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert problem consultation");
      } else {
        return createErrorObject(500);
      }
    }
  }
}