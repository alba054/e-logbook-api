import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { v4 as uuidv4 } from "uuid";
import db from "../../database";
import { Competency } from "../../models/Competency";
import { constants, createErrorObject, getUnixTimestamp } from "../../utils";
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
import { History } from "../../models/History";

export class CompetencyService {
  async deleteSkillById(id: string, tokenPayload: ITokenPayload) {
    const skill = await this.competencyModel.getSkillById(id);

    if (!skill) {
      return createErrorObject(404, "skill not found");
    }

    if (
      skill.supervisorId !== tokenPayload.supervisorId &&
      skill.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "skill not for you");
    }

    return db.competency.delete({
      where: {
        id,
      },
    });
  }
  async deleteCaseById(id: string, tokenPayload: ITokenPayload) {
    const cases = await this.competencyModel.getCaseById(id);

    if (!cases) {
      return createErrorObject(404, "cases not found");
    }

    if (
      cases.supervisorId !== tokenPayload.supervisorId &&
      cases.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "cases not for you");
    }

    return db.competency.delete({
      where: {
        id,
      },
    });
  }
  private studentService: StudentService;
  private competencyModel: Competency;
  private historyModel: History;

  constructor() {
    this.competencyModel = new Competency();
    this.historyModel = new History();
    this.studentService = new StudentService();
  }

  async getSkillsBySupervisorWithoutPage(tokenPayload: ITokenPayload) {
    return {
      data: await this.competencyModel.getSkillsBySupervisorWithoutPage_(
        tokenPayload.supervisorId
      ),
      count: await this.competencyModel.getSkillsBySupervisorWithoutPage(
        tokenPayload.supervisorId
      ),
    };
  }

  async getCasesBySupervisorWithoutPage(tokenPayload: ITokenPayload) {
    return {
      data: await this.competencyModel.getCasesBySupervisorWithoutPage_(
        tokenPayload.supervisorId
      ),
      count: await this.competencyModel.getCasesBySupervisorWithoutPage(
        tokenPayload.supervisorId
      ),
    };
  }

  async getSkillsByStudentIdWithoutPage(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    return {
      data: await this.competencyModel.getSkillsBySupervisorAndStudentIdWithoutPage_(
        tokenPayload.supervisorId,
        studentId
      ),
      count:
        await this.competencyModel.getSkillsBySupervisorAndStudentIdWithoutPage(
          tokenPayload.supervisorId,
          studentId
        ),
    };
  }

  async getCaseByStudentIdWithoutPage(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    return {
      data: await this.competencyModel.getCasesBySupervisorAndStudentIdWithoutPage_(
        tokenPayload.supervisorId,
        studentId
      ),
      count:
        await this.competencyModel.getCasesBySupervisorAndStudentIdWithoutPage(
          tokenPayload.supervisorId,
          studentId
        ),
    };
  }

  async getCompetenciesBySupervisorWithoutPage(tokenPayload: ITokenPayload) {
    return {
      data: await this.competencyModel.getCompetenciesBySupervisorWithoutPage(
        tokenPayload.supervisorId
      ),
      count: (
        await this.competencyModel.getCompetenciesBySupervisorWithoutPage(
          tokenPayload.supervisorId
        )
      ).length,
    };
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

  async getSkillsByStudentAndUnitIdBySupervisor(
    studentId: string,
    unitId: string
  ) {
    const skills = await this.competencyModel.getSkillsByStudentIdAndUnitId(
      studentId,
      unitId
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

  async getCasesByStudentAndUnitIdBySupervisor(
    studentId: string,
    unitId: string
  ) {
    const cases = await this.competencyModel.getCasesByStudentIdAndUnitId(
      studentId,
      unitId
    );

    return cases;
  }

  async getCompetenciesBySupervisor(
    tokenPayload: ITokenPayload,
    page: any,
    take: any,
    search: any,
    name: any,
    nim: any,
    type: any
  ) {
    if (search) {
      return {
        data: await this.competencyModel.getCompetenciesBySupervisorAndNameOrStudentId(
          tokenPayload.supervisorId,
          page,
          take,
          search
        ),
        count: (
          await this.competencyModel.getCompetenciesBySupervisorWithoutPage(
            tokenPayload.supervisorId
          )
        ).length,
      };
    }

    if (name || nim || type) {
      return {
        data: await this.competencyModel.getCompetenciesBySupervisorAndNameAndStudentIdAndType(
          tokenPayload.supervisorId,
          page,
          take,
          name,
          nim,
          type
        ),
        count: (
          await this.competencyModel.getCompetenciesBySupervisorWithoutPage(
            tokenPayload.supervisorId
          )
        ).length,
      };
    }

    return {
      data: await this.competencyModel.getCompetenciesBySupervisor(
        tokenPayload.supervisorId,
        page,
        take
      ),
      count: (
        await this.competencyModel.getCompetenciesBySupervisorWithoutPage(
          tokenPayload.supervisorId
        )
      ).length,
    };
  }

  async verifyCase(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutCaseVerificationStatus
  ) {
    const skill = await this.competencyModel.getCaseById(id);

    if (skill?.supervisorId !== tokenPayload.supervisorId) {
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
      this.historyModel.insertHistoryAsync(
        "CASE",
        getUnixTimestamp(),
        skill?.studentId ?? "",
        skill?.supervisorId,
        id,
        skill?.unitId ?? ""
      ),
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

  async getSkillsBySupervisor(
    tokenPayload: ITokenPayload,
    page: any,
    take: any,
    search: any
  ) {
    if (search) {
      return {
        data: await this.competencyModel.getSkillsBySupervisorAndNameOrStudentId(
          tokenPayload.supervisorId,
          page,
          take,
          search
        ),
        count: await this.competencyModel.getSkillsBySupervisorWithoutPage(
          tokenPayload.supervisorId
        ),
      };
    }

    return {
      data: await this.competencyModel.getSkillsBySupervisor(
        tokenPayload.supervisorId,
        page,
        take
      ),
      count: await this.competencyModel.getSkillsBySupervisorWithoutPage(
        tokenPayload.supervisorId
      ),
    };
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

  async getCasesBySupervisor(
    tokenPayload: ITokenPayload,
    page: any,
    take: any,
    search: any
  ) {
    if (search) {
      return {
        data: await this.competencyModel.getCasesBySupervisorAndNameOrStudentId(
          tokenPayload.supervisorId,
          page,
          take,
          search
        ),
        count: await this.competencyModel.getCasesBySupervisorWithoutPage(
          tokenPayload.supervisorId
        ),
      };
    }

    return {
      data: await this.competencyModel.getCasesBySupervisor(
        tokenPayload.supervisorId,
        page,
        take
      ),
      count: await this.competencyModel.getCasesBySupervisorWithoutPage(
        tokenPayload.supervisorId
      ),
    };
  }

  async getSkillsByStudentId(
    tokenPayload: ITokenPayload,
    studentId: string,
    page: any,
    take: any,
    search: any
  ) {
    if (search) {
      return {
        data: await this.competencyModel.getSkillsBySupervisorAndStudentIdAndTitle(
          tokenPayload.supervisorId,
          studentId,
          page,
          take,
          search
        ),
        count:
          await this.competencyModel.getSkillsBySupervisorAndStudentIdWithoutPage(
            tokenPayload.supervisorId,
            studentId
          ),
      };
    }

    return {
      data: await this.competencyModel.getSkillsBySupervisorAndStudentId(
        tokenPayload.supervisorId,
        studentId,
        page,
        take
      ),
      count:
        await this.competencyModel.getSkillsBySupervisorAndStudentIdWithoutPage(
          tokenPayload.supervisorId,
          studentId
        ),
    };
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
              studentId,
            },
            supervisorId: tokenPayload.supervisorId,
            type: "SKILL",
            OR: [
              {
                verificationStatus: "INPROCESS",
              },
              {
                verificationStatus: "UNVERIFIED",
              },
            ],
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
        // this.historyModel.insertHistoryAsync(
        //     "SKILLS",
        //     getUnixTimestamp(),
        //     skill?.studentId??'',
        //     skill?.supervisorId,
        //     id,
        //     skill?.unitId??''
        // ),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to verify all skills");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getCaseByStudentId(
    tokenPayload: ITokenPayload,
    studentId: string,
    page: any,
    take: any,
    search: any
  ) {
    if (search) {
      return {
        data: await this.competencyModel.getCasesBySupervisorAndStudentIdAndTitle(
          tokenPayload.supervisorId,
          studentId,
          page,
          take,
          search
        ),
        count:
          await this.competencyModel.getCasesBySupervisorAndStudentIdWithoutPage(
            tokenPayload.supervisorId,
            studentId
          ),
      };
    }

    return {
      data: await this.competencyModel.getCasesBySupervisorAndStudentId(
        tokenPayload.supervisorId,
        studentId,
        page,
        take
      ),
      count:
        await this.competencyModel.getCasesBySupervisorAndStudentIdWithoutPage(
          tokenPayload.supervisorId,
          studentId
        ),
    };
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
              studentId,
            },
            supervisorId: tokenPayload.supervisorId,
            type: "CASE",
            OR: [
              {
                verificationStatus: "INPROCESS",
              },
              {
                verificationStatus: "UNVERIFIED",
              },
            ],
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
        // this.historyModel.insertHistoryAsync(
        //     "CASES",
        //     getUnixTimestamp(),
        //     skill?.studentId??'',
        //     skill?.supervisorId,
        //     id,
        //     skill?.unitId??''
        // ),
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

    if (skill?.supervisorId !== tokenPayload.supervisorId) {
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
      this.historyModel.insertHistoryAsync(
        "SKILL",
        getUnixTimestamp(),
        skill?.studentId ?? "",
        skill?.supervisorId,
        id,
        skill?.unitId ?? ""
      ),
    ]);
  }
}
