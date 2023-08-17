import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { v4 as uuidv4 } from "uuid";
import db from "../../database";
import { Competency } from "../../models/Competency";
import { createErrorObject } from "../../utils";
import {
  IPostCase,
  IPutCasesVerificationStatus,
  IPutCaseVerificationStatus,
} from "../../utils/interfaces/Case";
import {
  IPostSkill,
  IPutSkillsVerificationStatus,
  IPutSkillVerificationStatus,
} from "../../utils/interfaces/Skill";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";

export class CompetencyService {
  private studentService: StudentService;
  private competencyModel: Competency;

  constructor() {
    this.competencyModel = new Competency();
    this.studentService = new StudentService();
  }

  async getSkillsByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const skills = await this.competencyModel.getSkillsByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );

    return skills;
  }

  async getCasesByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const cases = await this.competencyModel.getCasesByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );

    return cases;
  }

  async getCompetenciesBySupervisor(tokenPayload: ITokenPayload) {
    return this.competencyModel.getCompetenciesBySupervisor(
      tokenPayload.supervisorId
    );
  }

  async verifyCase(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutCaseVerificationStatus
  ) {
    const skill = await this.competencyModel.getCaseById(id);

    if (
      skill?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      skill?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      skill?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(
        400,
        "you are not authorized to verify this case"
      );
    }

    return db.$transaction([
      db.competency.update({
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
          caseDone: payload.verified,
        },
      }),
    ]);
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

  async insertNewSkill(tokenPayload: ITokenPayload, payload: IPostSkill) {
    const studentActiveUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.competencyModel.insertNewSkill(
      uuidv4(),
      payload,
      tokenPayload.studentId,
      studentActiveUnit?.activeUnit.activeUnit?.id
    );
  }

  async getSkillsBySupervisor(tokenPayload: ITokenPayload) {
    return this.competencyModel.getSkillsBySupervisor(
      tokenPayload.supervisorId
    );
  }

  async insertNewCase(tokenPayload: ITokenPayload, payload: IPostCase) {
    const studentActiveUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.competencyModel.insertNewCase(
      uuidv4(),
      payload,
      tokenPayload.studentId,
      studentActiveUnit?.activeUnit.activeUnit?.id
    );
  }

  async getCasesBySupervisor(tokenPayload: ITokenPayload) {
    return this.competencyModel.getCasesBySupervisor(tokenPayload.supervisorId);
  }

  async getSkillsByStudentId(tokenPayload: ITokenPayload, studentId: string) {
    return this.competencyModel.getSkillsBySupervisorAndStudentId(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async verifyAllStudentSkills(
    tokenPayload: ITokenPayload,
    studentId: string,
    payload?: IPutSkillsVerificationStatus
  ) {
    try {
      return db.$transaction([
        db.competency.updateMany({
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
            type: "SKILL",
          },
          data: {
            verificationStatus: "VERIFIED",
            rating: payload?.rating ?? 3,
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

  async getCaseByStudentId(tokenPayload: ITokenPayload, studentId: string) {
    return this.competencyModel.getCasesBySupervisorAndStudentId(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async verifyAllStudentCases(
    tokenPayload: ITokenPayload,
    studentId: string,
    payload?: IPutCasesVerificationStatus
  ) {
    try {
      return db.$transaction([
        db.competency.updateMany({
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
            type: "CASE",
          },
          data: {
            verificationStatus: "VERIFIED",
            rating: payload?.rating ?? 3,
          },
        }),
        db.checkInCheckOut.updateMany({
          where: {
            studentId,
          },
          data: {
            caseDone: true,
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to verify all cases");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async verifySkill(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutSkillVerificationStatus
  ) {
    const skill = await this.competencyModel.getSkillById(id);

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
      db.competency.update({
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
}
