import { Skill } from "../../models/Skill";
import {
  IPostSkill,
  IPutSkillVerificationStatus,
} from "../../utils/interfaces/Skill";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";
import db from "../../database";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createErrorObject } from "../../utils";

export class SkillService {
  private studentService: StudentService;
  private skillModel: Skill;

  constructor() {
    this.skillModel = new Skill();
    this.studentService = new StudentService();
  }

  async getSkillsByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const skills = await this.skillModel.getSkillsByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );

    return skills;
  }

  async verifySkill(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutSkillVerificationStatus
  ) {
    const skill = await this.skillModel.getSkillById(id);

    if (
      skill?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      skill?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      skill?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(
        400,
        "you are not authorized to verify this skill"
      );
    }

    return db.$transaction([
      db.skill.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
          rating: payload.rating,
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: skill?.unitId ?? "",
          studentId: skill?.studentId ?? "",
        },
        data: {
          skillDone: payload.verified,
        },
      }),
    ]);
  }

  async verifyAllStudentSkills(tokenPayload: ITokenPayload, studentId: string) {
    try {
      return db.$transaction([
        db.skill.updateMany({
          where: {
            Student: {
              OR: [
                {
                  academicSupervisorId: tokenPayload.supervisorId,
                },
                {
                  supervisingSupervisorId: tokenPayload.supervisorId,
                },
                {
                  examinerSupervisorId: tokenPayload.supervisorId,
                },
              ],
              studentId,
            },
          },
          data: {
            verificationStatus: "VERIFIED",
          },
        }),
        db.checkInCheckOut.updateMany({
          where: {
            studentId,
          },
          data: {
            skillDone: true,
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to verify all skills");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getSkillsByStudentId(tokenPayload: ITokenPayload, studentId: string) {
    return this.skillModel.getSkillsBySupervisorAndStudentId(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async getSkillsBySupervisor(tokenPayload: ITokenPayload) {
    return this.skillModel.getSkillsBySupervisor(tokenPayload.supervisorId);
  }

  async insertNewSkill(tokenPayload: ITokenPayload, payload: IPostSkill) {
    const studentActiveUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.skillModel.insertNewSkill(
      uuidv4(),
      payload,
      tokenPayload.studentId,
      studentActiveUnit?.activeUnit.activeUnit?.id
    );
  }
}
