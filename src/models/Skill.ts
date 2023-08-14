import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostSkill } from "../utils/interfaces/Skill";

export class Skill {
  async getSkillsByStudentIdAndUnitId(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    return db.skill.findMany({
      where: {
        studentId,
        unitId,
      },
      include: {
        Student: true,
      },
    });
  }

  async getSkillById(id: string) {
    return db.skill.findUnique({
      where: {
        id,
      },
      include: {
        Student: true,
      },
    });
  }

  async getSkillsBySupervisorAndStudentId(
    supervisorId: string | undefined,
    studentId: string
  ) {
    return db.skill.findMany({
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

  async getSkillsBySupervisor(supervisorId?: string) {
    return db.skill.findMany({
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

  async insertNewSkill(
    id: string,
    payload: IPostSkill,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return db.skill.create({
        data: {
          id,
          studentId,
          unitId,
          type: payload.type,
          name: payload.name,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new skill");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
