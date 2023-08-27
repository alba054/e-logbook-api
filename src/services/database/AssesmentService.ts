import db from "../../database";
import { v4 as uuidv4 } from "uuid";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { Assesment } from "../../models/Assesment";
import { createErrorObject } from "../../utils";
import {
  IPostMiniCex,
  IPutGradeItemMiniCex,
  IPutGradeItemMiniCexScore,
  IPutGradeItemMiniCexScoreV2,
  IPutGradeItemPersonalBehaviourVerificationStatus,
  IPutStudentAssesmentScore,
} from "../../utils/interfaces/Assesment";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class AssesmentService {
  private assesmentModel: Assesment;
  private studentService: StudentService;

  constructor() {
    this.assesmentModel = new Assesment();
    this.studentService = new StudentService();
  }

  async scoreOsceOrCBT(
    studentId: string,
    unitId: string,
    payload: IPutStudentAssesmentScore
  ) {
    const assesment =
      await this.assesmentModel.getAssesmentsByStudentIdAndUnitIdAndType(
        studentId,
        unitId,
        payload.type
      );

    if (payload.type === "CBT") {
      return this.assesmentModel.scoreCBT(
        assesment?.cBTId ?? "",
        payload.score
      );
    } else if (payload.type === "OSCE") {
      return this.assesmentModel.scoreOSCE(
        assesment?.oSCEId ?? "",
        payload.score
      );
    }
  }

  async getAssesmentsByStudentIdAndUnitId(studentId: string, unitId: string) {
    return this.assesmentModel.getAssesmentsByStudentIdAndUnitId(
      studentId,
      unitId
    );
  }

  async getAssesmentsByStudentId(studentId: string) {
    return this.assesmentModel.getAssesmentsByStudentId(studentId);
  }

  async getPersonalBehavioursByStudentIdAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.assesmentModel.getPersonalBehaviourByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }

  async verifyPersonalBehaviourGradeItem(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutGradeItemPersonalBehaviourVerificationStatus
  ) {
    const personalBehaviour =
      await this.assesmentModel.getPersonalBehaviourById(id);

    if (!personalBehaviour) {
      return createErrorObject(404, "personal behaviour's not found");
    }

    if (
      personalBehaviour?.studentId !== tokenPayload.studentId &&
      personalBehaviour?.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      personalBehaviour?.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      personalBehaviour?.Student?.academicSupervisorId !==
        tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "data's not for you");
    }

    if (
      !personalBehaviour.PersonalBehaviour?.PersonalBehaviourGrade.filter(
        (p) => p.id === payload.id
      ).length
    ) {
      return createErrorObject(400, "item's not found");
    }

    return this.assesmentModel.verifyPersonalBehaviourGradeItemVerificationStatus(
      payload
    );
  }

  async getPersonalBehaviourById(tokenPayload: ITokenPayload, id: string) {
    const miniCex = await this.assesmentModel.getPersonalBehaviourById(id);

    if (!miniCex) {
      return createErrorObject(404, "personal behaviour's not found");
    }

    if (
      miniCex.studentId !== tokenPayload.studentId &&
      miniCex?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "data's not for you");
    }

    return miniCex;
  }

  async getPersonalBehavioursByStudentId(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    const personalBehaviours =
      await this.assesmentModel.getPersonalBehavioursByStudentIdAndSupervisorId(
        studentId,
        tokenPayload.supervisorId
      );

    return personalBehaviours;
  }

  async scoreScientificAssesment(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutGradeItemMiniCexScore
  ) {
    const miniCex = await this.assesmentModel.getScientificAssesmentById(id);

    if (!miniCex) {
      return createErrorObject(404, "scientific assesment's not found");
    }

    if (
      miniCex?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "data's not for you");
    }

    return db.$transaction(
      payload.scores.map((s) => {
        return db.scientificAssesmentGrade.update({
          where: {
            id: s.id,
          },
          data: {
            score: s.score,
          },
        });
      })
    );
  }

  async getScientificAssesmentsByStudentIdAndUnitId(
    tokenPayload: ITokenPayload
  ) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.assesmentModel.getScientificAssesmentsByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }

  async getScientificAssesmentById(tokenPayload: ITokenPayload, id: string) {
    const miniCex = await this.assesmentModel.getScientificAssesmentById(id);

    if (!miniCex) {
      return createErrorObject(404, "scientific assesment's not found");
    }

    if (
      miniCex.studentId !== tokenPayload.studentId &&
      miniCex?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "data's not for you");
    }

    return miniCex;
  }

  async scoreMiniCex(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutGradeItemMiniCexScore
  ) {
    const miniCex = await this.assesmentModel.getMiniCexById(id);

    if (!miniCex) {
      return createErrorObject(404, "mini cex's not found");
    }

    if (
      miniCex?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "data's not for you");
    }

    return db.$transaction(
      payload.scores.map((s) => {
        return db.miniCexGrade.update({
          where: {
            id: s.id,
          },
          data: {
            score: s.score,
          },
        });
      })
    );
  }

  async scoreMiniCexV2(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutGradeItemMiniCexScoreV2
  ) {
    const miniCex = await this.assesmentModel.getMiniCexById(id);

    if (!miniCex) {
      return createErrorObject(404, "mini cex's not found");
    }

    if (
      miniCex?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "data's not for you");
    }

    return db.$transaction([
      db.miniCexGrade.deleteMany({
        where: {
          miniCexId: id,
        },
      }),
      db.miniCexGrade.createMany({
        data: payload.scores.map((s) => {
          return {
            miniCexId: id,
            score: s.score,
            name: s.name,
          };
        }),
      }),
    ]);
  }

  async getMiniCexsByStudentIdAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.assesmentModel.getMiniCexAssesmentByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }

  async addGradeItemToMiniCex(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutGradeItemMiniCex
  ) {
    const miniCex = await this.assesmentModel.getMiniCexById(id);

    if (!miniCex) {
      return createErrorObject(404, "mini cex's not found");
    }

    if (
      miniCex?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "data's not for you");
    }

    return this.assesmentModel.insertGradeItemMiniCex(id, payload);
  }

  async getMiniCexsById(tokenPayload: ITokenPayload, id: string) {
    const miniCex = await this.assesmentModel.getMiniCexById(id);

    if (!miniCex) {
      return createErrorObject(404, "mini cex's not found");
    }

    if (
      miniCex.studentId !== tokenPayload.studentId &&
      miniCex?.Student?.examinerSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.supervisingSupervisorId !== tokenPayload.supervisorId &&
      miniCex?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "data's not for you");
    }

    return miniCex;
  }

  async getScientificAssesmentByStudentId(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    const scientificAssesment =
      await this.assesmentModel.getScientificAssesmentByStudentIdAndSupervisorId(
        studentId,
        tokenPayload.supervisorId
      );

    return scientificAssesment;
  }

  async addMiniCexAssesment(
    tokenPayload: ITokenPayload,
    payload: IPostMiniCex
  ) {
    try {
      const activeUnit = await this.studentService.getActiveUnit(
        tokenPayload.studentId ?? ""
      );
      const miniCexId = uuidv4();

      return db.$transaction([
        db.miniCex.create({
          data: {
            id: miniCexId,
            activityLocationId: payload.location,
            case: payload.case,
          },
        }),
        db.assesment.create({
          data: {
            id: uuidv4(),
            type: "MINI_CEX",
            studentId: tokenPayload.studentId,
            unitId: activeUnit?.activeUnit.activeUnit?.id,
            miniCexId,
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to add mini cex assesment");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getMiniCexsByStudentId(tokenPayload: ITokenPayload, studentId: string) {
    const miniCexs =
      await this.assesmentModel.getMiniCexAssesmentByStudentIdAndSupervisorId(
        studentId,
        tokenPayload.supervisorId
      );

    return miniCexs;
  }
}
