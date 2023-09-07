import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import {
  IPostProblemConsultation,
  IPutProblemConsultation,
} from "../utils/interfaces/ProblemConsultation";
import { History } from "./History";

export class ProblemConsultation {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

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
        verificationStatus: "INPROCESS",
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
        Unit: true,
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
      return (
        await db.$transaction([
          db.problemConsultation.create({
            data: {
              problem: payload.content,
              id,
              studentId,
              unitId,
            },
          }),
          this.historyModel.insertHistoryAsync(
            "PROBLEM_CONSULTATION",
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
        return createErrorObject(400, "failed to insert problem consultation");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
