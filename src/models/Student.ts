import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import {
  IPutStudentActiveUnit,
  IPutStudentData,
} from "../utils/interfaces/Student";
import { constants, createErrorObject } from "../utils";

export class Student {
  constructor() {}

  async getStudentBySupervisorIdWithoutPage_(supervisorId: string | undefined) {
    return db.student.findMany({
      where: {
        OR: [
          { supervisingSupervisorId: supervisorId },
          { academicSupervisorId: supervisorId },
          { examinerSupervisorId: supervisorId },
        ],
      },
      include: {
        activeUnit: true,
        User: true,
      },
    });
  }

  async getAllStudentsWithoutPage_() {
    return db.student.findMany({
      include: {
        activeUnit: true,
        User: true,
      },
    });
  }

  async getAllStudentsWithoutPageBySupervisorId(
    supervisorId: string | undefined
  ) {
    return db.student.count({
      where: {
        supervisingSupervisorId: supervisorId,
        academicSupervisorId: supervisorId,
        examinerSupervisorId: supervisorId,
      },
    });
  }

  async getAllStudentsWithoutPage() {
    return db.student.count();
  }

  async getAllStudentsBySearchFullNameOrNIMAndSupervisorId(
    supervisorId: string | undefined,
    page: any,
    take: any,
    search: any
  ) {
    return db.student.findMany({
      where: {
        AND: [
          {
            OR: [
              { supervisingSupervisorId: supervisorId },
              { academicSupervisorId: supervisorId },
              { examinerSupervisorId: supervisorId },
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
      include: {
        activeUnit: true,
        User: true,
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getAllStudentsBySearchFullNameOrNIM(page: any, take: any, search: any) {
    return db.student.findMany({
      where: {
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
      include: {
        activeUnit: true,
        User: true,
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getAllStudents(
    page: number | undefined,
    take: number | undefined,
    search: string | undefined
  ) {
    return db.student.findMany({
      include: {
        activeUnit: true,
        User: true,
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getStudentBySupervisorId(supervisorId: string | undefined) {
    return db.student.findMany({
      where: {
        OR: [
          { supervisingSupervisorId: supervisorId },
          { academicSupervisorId: supervisorId },
          { examinerSupervisorId: supervisorId },
        ],
      },
      include: {
        activeUnit: true,
        User: true,
      },
    });
  }

  async getStudentByStudentId(studentId: string) {
    return db.student.findUnique({
      where: {
        studentId,
      },
      include: {
        CheckInCheckOut: true,
        supervisingDPK: true,
        academicAdvisor: true,
        examinerDPK: true,
        User: true,
      },
    });
  }

  async getStudentById(studentId: string | undefined) {
    return db.student.findUnique({
      where: {
        id: studentId,
      },
      include: {
        CheckInCheckOut: true,
        supervisingDPK: true,
        academicAdvisor: true,
        examinerDPK: true,
      },
    });
  }

  async updateStudentProfile(studentId?: string, payload?: IPutStudentData) {
    try {
      return db.student.update({
        where: {
          id: studentId,
        },
        data: {
          academicSupervisorId: payload?.academicSupervisor,
          address: payload?.address,
          clinicId: payload?.clinicId,
          examinerSupervisorId: payload?.examinerDPK,
          graduationDate: payload?.graduationDate,
          phoneNumber: payload?.phoneNumber,
          preClinicId: payload?.preclinicId,
          supervisingSupervisorId: payload?.supervisingDPK,
          periodLengthStation: payload?.periodLengthStation,
          pkmStation: payload?.pkmStation,
          rsStation: payload?.rsStation,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update student profile");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getActiveUnitByStudentId(studentId: string) {
    return db.student.findUnique({
      where: {
        studentId,
      },
      select: {
        activeUnit: true,
        id: true,
      },
    });
  }

  async getActiveUnit(studentId: string) {
    return db.student.findUnique({
      where: {
        id: studentId,
      },
      select: {
        activeUnit: true,
      },
    });
  }

  async updateStudentActiveUnitByStudentId(
    studentId: string,
    payload: IPutStudentActiveUnit
  ) {
    try {
      return db.student.update({
        where: {
          id: studentId,
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
