import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ScientificSession } from "../../models/ScientificSession";
import { createErrorObject } from "../../utils";
import {
  IPostScientificSessionPayload,
  IPutFeedbackScientificSession,
  IPutVerificationStatusScientificSession,
} from "../../utils/interfaces/ScientificSession";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";
import db from "../../database";
import { Assesment } from "../../models/Assesment";

export class ScientificSessionService {
  private studentService: StudentService;
  private scientificSessionModel: ScientificSession;
  private assesmentModel: Assesment;
  constructor() {
    this.scientificSessionModel = new ScientificSession();
    this.assesmentModel = new Assesment();
    this.studentService = new StudentService();
  }

  async giveFeedbackToScientificSession(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutFeedbackScientificSession
  ) {
    const ScientificSession =
      await this.scientificSessionModel.getScientificSessionById(id);

    if (!ScientificSession) {
      return createErrorObject(404, "scientific session's not found");
    }

    if (
      ScientificSession.supervisorId !== tokenPayload.supervisorId &&
      ScientificSession.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "scientific session's not for you");
    }

    if (tokenPayload.studentId) {
      return this.scientificSessionModel.insertStudentFeedback(
        id,
        payload.feedback
      );
    } else if (tokenPayload.supervisorId) {
      return this.scientificSessionModel.insertSupervisorFeedback(
        id,
        payload.feedback
      );
    }

    return null;
  }

  async getScientificSessionsByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const scientificSessions =
      await this.scientificSessionModel.getScientificSessionsByStudentIdAndUnitId(
        tokenPayload.studentId ?? "",
        activeUnit?.activeUnit.activeUnit?.id
      );

    return {
      scientificSessions,
      verifiedCounts: scientificSessions.filter(
        (c) => c.verificationStatus === "VERIFIED"
      ).length,
      unverifiedCounts: scientificSessions.filter(
        (c) =>
          c.verificationStatus === "UNVERIFIED" ||
          c.verificationStatus === "INPROCESS"
      ).length,
    };
  }

  async getAttachmentByScientificSessionId(
    id: string,
    tokenPayload: ITokenPayload
  ) {
    const scientificSession =
      await this.scientificSessionModel.getScientificSessionById(id);

    if (
      scientificSession?.supervisorId !== tokenPayload.supervisorId &&
      scientificSession?.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "this attachment is not for you");
    }

    if (!scientificSession?.attachment) {
      return createErrorObject(404, "attachment's not found");
    }

    return scientificSession.attachment;
  }

  async getSubmittedScientificSessions(status: any, supervisorId?: string) {
    if (status) {
      return this.scientificSessionModel.getScientificSessionsByStatusAndSupervisorId(
        status,
        supervisorId
      );
    }

    return this.scientificSessionModel.getScientificSessionsBySupervisorId(
      supervisorId
    );
  }

  async verifyScientificSession(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutVerificationStatusScientificSession
  ) {
    const scientificSession =
      await this.scientificSessionModel.getScientificSessionById(id);

    if (!scientificSession) {
      return createErrorObject(404, "scientific session's not found");
    }

    if (
      scientificSession.supervisorId !== tokenPayload.supervisorId &&
      scientificSession.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "scientific session's not for you");
    }

    const scientificAssesment =
      await this.assesmentModel.getScientificAssesmentByStudentIdAndUnitId(
        scientificSession.studentId,
        scientificSession.unitId
      );

    const scientificAssesmentId = uuidv4();
    let scientificAssesmentQuery: any[] = [];

    if (!scientificAssesment.length) {
      scientificAssesmentQuery = [
        db.scientificAssesment.create({
          data: {
            id: scientificAssesmentId,
          },
        }),
        db.assesment.create({
          data: {
            id: uuidv4(),
            type: "SCIENTIFIC_ASSESMENT",
            scientificAssesmentId,
            studentId: scientificSession.studentId,
            unitId: scientificSession.unitId,
          },
        }),
      ];
    }

    return db.$transaction([
      db.scientificSession.update({
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
          unitId: scientificSession.unitId ?? "",
          studentId: scientificSession.studentId ?? "",
        },
        data: {
          scientificSessionDone: payload.verified,
        },
      }),
      ...scientificAssesmentQuery,
    ]);
  }

  async getScientificSessionDetail(id: string, tokenPayload: ITokenPayload) {
    const scientificSession =
      await this.scientificSessionModel.getScientificSessionById(id);

    if (!scientificSession) {
      return createErrorObject(404, "scientific session's not found");
    }

    if (
      scientificSession.supervisorId !== tokenPayload.supervisorId &&
      scientificSession.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "scientific session's not for you");
    }

    return scientificSession;
  }

  async insertNewScientificSession(
    tokenPayload: ITokenPayload,
    payload: IPostScientificSessionPayload
  ) {
    try {
      const studentActiveUnit = await this.studentService.getActiveUnit(
        tokenPayload.studentId ?? ""
      );

      return this.scientificSessionModel.insertScientificSession(
        payload,
        uuidv4(),
        tokenPayload.studentId,
        studentActiveUnit?.activeUnit.activeUnit?.id
      );
    } catch (error) {
      console.log(error);

      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, error.message);
      } else {
        return createErrorObject(500);
      }
    }
  }
}
