import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import db from "../database";
import { constants, createErrorObject } from "../utils";
import { HistoryType } from "@prisma/client";

const HISTORY_NAME_MAP = new Map<HistoryType, string>();
HISTORY_NAME_MAP.set("CLINICAL_RECORD", "Clinical Record");
HISTORY_NAME_MAP.set("SCIENTIFIC_SESSION", "Scientific Session");
HISTORY_NAME_MAP.set("SELF_REFLECTION", "Self-Reflection");
HISTORY_NAME_MAP.set("COMPETENCY", "Competency");
HISTORY_NAME_MAP.set("ASSESMENT", "Assesment");
HISTORY_NAME_MAP.set("PROBLEM_CONSULTATION", "Problem Consultation");
HISTORY_NAME_MAP.set("CHECK_IN", "Check-in");
HISTORY_NAME_MAP.set("CHECK_OUT", "Check-out");

export class History {
  static getHistoryName(type: HistoryType) {
    return HISTORY_NAME_MAP.get(type) ?? type;
  }

  async getHistory(
    page: number = 0,
    elemPerPage: number = constants.HISTORY_ELEMENTS_PER_PAGE,
    checkin?: boolean,
    headDivUnit?: string | undefined
  ) {
    try {
      if (checkin) {
        return db.history.findMany({
          where: {
            AND: [
              { unitId: headDivUnit },
              { OR: [{ type: "CHECK_IN" }, { type: "CHECK_OUT" }] },
            ],
          },
          skip: page * elemPerPage,
          take: elemPerPage,
          orderBy: {
            timestamp: "desc",
          },
          include: {
            student: true,
            supervisor: true,
            Unit: true,
          },
        });
      }
      return db.history.findMany({
        skip: page * elemPerPage,
        take: elemPerPage,
        orderBy: {
          timestamp: "desc",
        },
        include: {
          student: true,
          supervisor: true,
          Unit: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(500, "failed to query history");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getHistoryBySupervisors(
    supervisorId: string[],
    page: number = 0,
    elemPerPage: number = constants.HISTORY_ELEMENTS_PER_PAGE,
    checkin?: boolean
  ) {
    try {
      if (checkin) {
        return db.history.findMany({
          where: {
            AND: [
              { OR: supervisorId.map(History.remapSupervisor) },
              { OR: [{ type: "CHECK_IN" }, { type: "CHECK_OUT" }] },
            ],
          },
          skip: page * elemPerPage,
          take: elemPerPage,
          orderBy: {
            timestamp: "desc",
          },
          include: {
            student: true,
            supervisor: true,
            Unit: true,
          },
        });
      }
      return db.history.findMany({
        skip: page * elemPerPage,
        take: elemPerPage,
        where: {
          OR: supervisorId.map(History.remapSupervisor),
        },
        orderBy: {
          timestamp: "desc",
        },
        include: {
          student: true,
          supervisor: true,
          Unit: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(500, "failed to query history");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getHistoryByStudents(
    studentId: string[],
    page: number = 0,
    elemPerPage: number = constants.HISTORY_ELEMENTS_PER_PAGE,
    checkin?: boolean
  ) {
    try {
      if (checkin) {
        return db.history.findMany({
          where: {
            AND: [
              { OR: studentId.map(History.remapSupervisor) },
              { OR: [{ type: "CHECK_IN" }, { type: "CHECK_OUT" }] },
            ],
          },
          skip: page * elemPerPage,
          take: elemPerPage,
          orderBy: {
            timestamp: "desc",
          },
          include: {
            student: true,
            supervisor: true,
            Unit: true,
          },
        });
      }
      return db.history.findMany({
        skip: page * elemPerPage,
        take: elemPerPage,
        where: {
          OR: studentId.map(History.remapStudent),
        },
        orderBy: {
          timestamp: "desc",
        },
        include: {
          student: true,
          supervisor: true,
          Unit: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(500, "failed to query history");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertHistory(
    type: HistoryType,
    timestamp: number,
    studentId?: string,
    supervisorId?: string,
    attachment?: string,
    unitId?: string
  ) {
    const history = await this.insertHistoryAsync(
      type,
      timestamp,
      studentId,
      supervisorId,
      attachment,
      unitId
    );

    return history;
  }

  insertHistoryAsync(
    type: HistoryType,
    timestamp: number,
    studentId?: string,
    supervisorId?: string,
    attachment?: string,
    unitId?: string
  ) {
    return db.history.create({
      data: {
        type,
        timestamp,
        studentId,
        supervisorId,
        attachment,
        unitId,
      },
    });
  }

  private static remapStudent(value: string) {
    return { studentId: value };
  }

  private static remapSupervisor(value: string) {
    return { supervisorId: value };
  }
}
