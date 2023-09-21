import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { constants, createErrorObject, getUnixTimestamp } from "../utils";
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

  async getProblemConsultationsBySupervisorWithoutPage_(
    supervisorId: string | undefined
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

  async getProblemConsultationsBySupervisorAndNameAndStudentId(
    supervisorId: string | undefined,
    page: any,
    take: any,
    name: any,
    nim: any
  ) {
    return db.problemConsultation.findMany({
      where: {
        Student: {
          AND: [
            {
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
            {
              AND: [
                {
                  studentId: {
                    contains: nim,
                  },
                },

                {
                  fullName: {
                    contains: name,
                  },
                },
              ],
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
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getProblemConsultationsBySupervisorWithoutPage(
    supervisorId: string | undefined
  ) {
    return db.problemConsultation.count({
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
      },
    });
  }

  async getProblemConsultationsBySupervisorAndNameOrStudentId(
    supervisorId: string | undefined,
    page: any,
    take: any,
    search: any
  ) {
    return db.problemConsultation.findMany({
      where: {
        Student: {
          AND: [
            {
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
            {
              OR: [
                {
                  studentId: {
                    contains: search,
                  },
                },

                {
                  fullName: {
                    contains: search,
                  },
                },
              ],
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
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
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

  async getProblemConsultationsBySupervisor(
    supervisorId: string | undefined,
    page: number | undefined,
    take: number | undefined
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
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
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
