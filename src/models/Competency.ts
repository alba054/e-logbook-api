import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { constants, createErrorObject, getUnixTimestamp } from "../utils";
import { IPostCase } from "../utils/interfaces/Case";
import { IPostSkill } from "../utils/interfaces/Skill";
import { History } from "./History";

export class Competency {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async getCasesBySupervisorAndStudentIdWithoutPage(
    supervisorId: string | undefined,
    studentId: string
  ) {
    return db.competency.count({
      where: {
        supervisorId,
        Student: {
          studentId,
        },
        type: "CASE",
      },
    });
  }

  async getCasesBySupervisorAndStudentIdAndTitle(
    supervisorId: string | undefined,
    studentId: string,
    page: any,
    take: any,
    search: any
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        Student: {
          studentId,
        },
        skill: {
          name: { contains: search },
        },
        type: "CASE",
      },
      include: {
        case: true,
        skill: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getSkillsBySupervisorAndStudentIdWithoutPage(
    supervisorId: string | undefined,
    studentId: string | undefined
  ) {
    return db.competency.count({
      where: {
        supervisorId,
        Student: {
          studentId,
        },
        type: "SKILL",
      },
    });
  }

  async getSkillsBySupervisorAndStudentIdAndTitle(
    supervisorId: string | undefined,
    studentId: string,
    page: any,
    take: any,
    search: any
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        Student: {
          studentId,
        },
        skill: {
          name: { contains: search },
        },
        type: "SKILL",
      },
      include: {
        case: true,
        skill: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getCasesBySupervisorWithoutPage(supervisorId: string | undefined) {
    return db.competency.count({
      where: {
        supervisorId,
      },
    });
  }

  async getCasesBySupervisorAndNameOrStudentId(
    supervisorId: string | undefined,
    page: any,
    take: any,
    search: any
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        verificationStatus: "INPROCESS",
        type: "CASE",
        Student: {
          OR: [
            {
              fullName: { contains: search },
            },
            {
              studentId: { contains: search },
            },
          ],
        },
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

  async getSkillsBySupervisorWithoutPage(supervisorId: string | undefined) {
    return db.competency.count({
      where: {
        supervisorId,
      },
    });
  }

  async getSkillsBySupervisorAndNameOrStudentId(
    supervisorId: string | undefined,
    page: any,
    take: any,
    search: any
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        verificationStatus: "INPROCESS",
        type: "SKILL",
        Student: {
          OR: [
            {
              fullName: { contains: search },
            },
            {
              studentId: { contains: search },
            },
          ],
        },
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

  async getCompetenciesBySupervisorAndNameAndStudentIdAndType(
    supervisorId: string | undefined,
    page: any,
    take: any,
    name: any,
    nim: any,
    type?: "CASE" | "SKILL"
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        verificationStatus: "INPROCESS",
        Student: {
          AND: [
            {
              fullName: { contains: name },
            },
            {
              studentId: { contains: nim },
            },
          ],
        },
        type,
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["studentId", "type"],
      include: {
        Student: true,
        Unit: true,
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getCompetenciesBySupervisorWithoutPage(
    supervisorId: string | undefined
  ) {
    return db.competency.count({
      where: {
        supervisorId,
      },
      distinct: ["studentId", "type"],
    });
  }

  async getCompetenciesBySupervisorAndNameOrStudentId(
    supervisorId: string | undefined,
    page: any,
    take: any,
    search: any
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        verificationStatus: "INPROCESS",
        Student: {
          OR: [
            {
              fullName: { contains: search },
            },
            {
              studentId: { contains: search },
            },
          ],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["studentId", "type"],
      include: {
        Student: true,
        Unit: true,
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getSkillsByStudentIdAndUnitId(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    return db.competency.findMany({
      where: {
        studentId: studentId === null ? undefined : studentId,
        unitId: unitId === null ? undefined : unitId,
        type: "SKILL",
      },
      include: {
        Student: true,
        skill: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getCasesByStudentIdAndUnitId(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    return db.competency.findMany({
      where: {
        studentId: studentId === null ? undefined : studentId,
        unitId: unitId === null ? undefined : unitId,
        type: "CASE",
      },
      include: {
        Student: true,
        case: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getCompetenciesBySupervisor(
    supervisorId: string | undefined,
    page: number | undefined,
    take: number | undefined
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        verificationStatus: "INPROCESS",
      },
      orderBy: {
        createdAt: "desc",
      },
      distinct: ["studentId", "type"],
      include: {
        Student: true,
        Unit: true,
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getCaseById(id: string) {
    return db.competency.findUnique({
      where: {
        id,
      },
      include: {
        Student: true,
      },
    });
  }

  async getSkillById(id: string) {
    return db.competency.findUnique({
      where: {
        id,
      },
      include: {
        Student: true,
      },
    });
  }

  async getCasesBySupervisorAndStudentId(
    supervisorId: string | undefined,
    studentId: string,
    page: number | undefined,
    take: number | undefined
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        Student: {
          studentId,
        },
        type: "CASE",
      },
      include: {
        skill: true,
        case: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getSkillsBySupervisorAndStudentId(
    supervisorId: string | undefined,
    studentId: string,
    page: number | undefined,
    take: number | undefined
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        Student: {
          studentId,
        },
        type: "SKILL",
      },
      include: {
        case: true,
        skill: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async getCasesBySupervisor(
    supervisorId: string | undefined,
    page: number | undefined,
    take: number | undefined
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        verificationStatus: "INPROCESS",
        type: "CASE",
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

  async insertNewCase(
    id: string,
    payload: IPostCase,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return (
        await db.$transaction([
          db.competency.create({
            data: {
              id,
              studentId,
              unitId,
              competencyType: payload.type,
              type: "CASE",
              caseTypeId: payload.caseTypeId,
              supervisorId: payload.supervisorId,
            },
          }),
          this.historyModel.insertHistoryAsync(
            "CASE",
            getUnixTimestamp(),
            studentId,
            payload.supervisorId,
            id,
            unitId
          ),
        ])
      )[0];
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new case");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getSkillsBySupervisor(
    supervisorId?: string,
    page?: number,
    take?: number
  ) {
    return db.competency.findMany({
      where: {
        supervisorId,
        verificationStatus: "INPROCESS",
        type: "SKILL",
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

  async insertNewSkill(
    id: string,
    payload: IPostSkill,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return (
        await db.$transaction([
          db.competency.create({
            data: {
              id,
              studentId,
              unitId,
              competencyType: payload.type,
              type: "SKILL",
              skillTypeId: payload.skillTypeId,
              supervisorId: payload.supervisorId,
            },
          }),
          this.historyModel.insertHistoryAsync(
            "SKILL",
            getUnixTimestamp(),
            studentId,
            payload.supervisorId,
            id,
            unitId
          ),
        ])
      )[0];
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new skill");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
