import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import { IPostCase } from "../utils/interfaces/Case";
import { IPostSkill } from "../utils/interfaces/Skill";
import { History } from "./History";

export class Competency {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async getSkillsByStudentIdAndUnitId(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    return db.competency.findMany({
      where: {
        studentId,
        unitId,
        type: "SKILL",
      },
      include: {
        Student: true,
        skill: true,
      },
    });
  }

  async getCasesByStudentIdAndUnitId(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    return db.competency.findMany({
      where: {
        studentId,
        unitId,
        type: "CASE",
      },
      include: {
        Student: true,
        case: true,
      },
    });
  }

  async getCompetenciesBySupervisor(supervisorId: string | undefined) {
    return db.competency.findMany({
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
      distinct: ["studentId", "type"],
      include: {
        Student: true,
      },
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
    studentId: string
  ) {
    return db.competency.findMany({
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
        type: "CASE",
      },
      include: {
        skill: true,
        case: true,
      },
    });
  }

  async getSkillsBySupervisorAndStudentId(
    supervisorId: string | undefined,
    studentId: string
  ) {
    return db.competency.findMany({
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
        type: "SKILL",
      },
      include: {
        case: true,
        skill: true,
      },
    });
  }

  async getCasesBySupervisor(supervisorId?: string) {
    return db.competency.findMany({
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
        type: "CASE",
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

  async insertNewCase(
    id: string,
    payload: IPostCase,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return (await db.$transaction([
        db.competency.create({
          data: {
            id,
            studentId,
            unitId,
            competencyType: payload.type,
            type: "CASE",
            caseTypeId: payload.caseTypeId,
          },
        }),
        this.historyModel.insertHistoryAsync(
          "COMPETENCY",
          getUnixTimestamp(),
          studentId,
          undefined,
          id
        )
      ]))[0]
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new case");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getSkillsBySupervisor(supervisorId?: string) {
    return db.competency.findMany({
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
        type: "SKILL",
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

  async insertNewSkill(
    id: string,
    payload: IPostSkill,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return (await db.$transaction([
        db.competency.create({
          data: {
            id,
            studentId,
            unitId,
            competencyType: payload.type,
            type: "SKILL",
            skillTypeId: payload.skillTypeId,
          },
        }),
        this.historyModel.insertHistoryAsync(
          "COMPETENCY",
          getUnixTimestamp(),
          studentId,
          undefined,
          id
        )
      ]))[0]
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new skill");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
