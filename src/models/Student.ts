import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import {
  IPutStudentActiveUnit,
  IPutStudentData,
} from "../utils/interfaces/Student";
import { createErrorObject } from "../utils";

export class Student {
  constructor() {}
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
