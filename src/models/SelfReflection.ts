import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { constants, createErrorObject, getUnixTimestamp } from "../utils";
import {
  IPostSelfReflection,
  IPutSelfReflection,
} from "../utils/interfaces/SelfReflection";
import { History } from "./History";

export class SelfReflection {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async getSelfReflectionsBySupervisorWithoutPage_(
    supervisorId: string | undefined
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

  async getSelfReflectionsBySupervisorAndNameAndStudentId(
    supervisorId: string | undefined,
    page: any,
    take: any,
    name: any,
    nim: any
  ) {
    return db.selfReflection.findMany({
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

  async getSelfReflectionsBySupervisorWithoutPage(
    supervisorId: string | undefined
  ) {
    return db.selfReflection.count({
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

  async getSelfReflectionsBySupervisorAndNameOrStudentId(
    supervisorId: string | undefined,
    page: any,
    take: any,
    search: any
  ) {
    return db.selfReflection.findMany({
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
    studentId: string,
    activeUnit?: string
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
          unitId: activeUnit,
        },
      },
    });
  }

  async getSelfReflectionsBySupervisor(
    supervisorId: string | undefined,
    page: number | undefined,
    take: number | undefined
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
