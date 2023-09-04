import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ScientificSession } from "../../models/ScientificSession";
import { createErrorObject, getUnixTimestamp } from "../../utils";
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
import { ScientificAssesmentGradeItemService } from "./ScientificAssesmentGradeItemService";
import { History } from "../../models/History";

export class ScientificSessionService {
  private studentService: StudentService;
  private scientificSessionModel: ScientificSession;
  private assesmentModel: Assesment;
  private scientificAssesmentGradeItemService: ScientificAssesmentGradeItemService;
  private historyModel: History;

  constructor() {
    this.scientificSessionModel = new ScientificSession();
    this.assesmentModel = new Assesment();
    this.studentService = new StudentService();
    this.scientificAssesmentGradeItemService =
      new ScientificAssesmentGradeItemService();
    this.historyModel = new History();
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

  async getSubmittedScientificSessions(
    status: any,
    page: any,
    take: any,
    name: any,
    nim: any,
    supervisorId?: string
  ) {
    if (status) {
      return {
        data: await this.scientificSessionModel.getScientificSessionsByStatusAndSupervisorId(
          status,
          page,
          take,
          name,
          nim,
          supervisorId
        ),
        count: (
          await this.scientificSessionModel.getScientificSessionsBySupervisorId(
            supervisorId
          )
        ).length,
      };
    }

    return {
      data: await this.scientificSessionModel.getScientificSessionsBySupervisorId(
        supervisorId
      ),
      count: (
        await this.scientificSessionModel.getScientificSessionsBySupervisorId(
          supervisorId
        )
      ).length,
    };
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

    // const scientificAssesment =
    //   await this.assesmentModel.getScientificAssesmentByStudentIdAndUnitId(
    //     scientificSession.studentId,
    //     scientificSession.unitId
    //   );

    // const scientificAssesmentId = uuidv4();
    // let scientificAssesmentQuery: any[] = [];

    // const scientificAssesmentGradeItems =
    //   await this.scientificAssesmentGradeItemService.getScientificAssesmentGradeItemByUnitId();
    // if (!scientificAssesment.length) {
    //   scientificAssesmentQuery = [
    //     db.scientificAssesment.create({
    //       data: {
    //         id: scientificAssesmentId,
    //         grades: {
    //           create: scientificAssesmentGradeItems.map((s) => {
    //             return {
    //               scientificAssesmentGradeItemId: s.id,
    //               score: 0,
    //             };
    //           }),
    //         },
    //       },
    //     }),
    //     db.assesment.create({
    //       data: {
    //         id: uuidv4(),
    //         type: "SCIENTIFIC_ASSESMENT",
    //         scientificAssesmentId,
    //         studentId: scientificSession.studentId,
    //         unitId: scientificSession.unitId,
    //       },
    //     }),
    //   ];
    // }

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
      // ...scientificAssesmentQuery,
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
