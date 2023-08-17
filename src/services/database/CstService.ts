import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";
import { createErrorObject } from "../../utils";
import db from "../../database";
import {
  IPostCST,
  IPutCstTopicVerificationStatus,
} from "../../utils/interfaces/Cst";
import { Cst } from "../../models/Cst";

export class CstService {
  private studentService: StudentService;
  private cstModel: Cst;

  constructor() {
    this.studentService = new StudentService();
    this.cstModel = new Cst();
  }

  async verifyCst(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutCstTopicVerificationStatus
  ) {
    const Cst = await this.cstModel.getCstById(id);

    if (!Cst) {
      return createErrorObject(404, "Cst topic's not found");
    }

    if (!Cst.topics.every((s) => s.verificationStatus === "VERIFIED")) {
      return createErrorObject(
        400,
        "Cst is not ready to verified because some topics are unverified"
      );
    }

    return db.$transaction([
      db.cST.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: Cst?.unitId ?? "",
          studentId: Cst?.studentId ?? "",
        },
        data: {
          cstDone: payload.verified,
        },
      }),
    ]);
  }

  async verifyCstTopic(
    topicId: string,
    tokenPayload: ITokenPayload,
    payload: IPutCstTopicVerificationStatus
  ) {
    const CstTopic = await this.cstModel.getCstTopicById(topicId);

    if (!CstTopic) {
      return createErrorObject(404, "Cst topic's not found");
    }

    if (CstTopic?.supervisorId !== tokenPayload.supervisorId) {
      return createErrorObject(
        400,
        "you are not authorized to verify this Cst"
      );
    }

    return this.cstModel.verifyCstTopicById(topicId, payload);
  }

  async getCstsBySupervisorAndStudentId(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    return this.cstModel.getCstsBySupervisorIdAndStudentId(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async getCstsBySupervisor(tokenPayload: ITokenPayload) {
    return this.cstModel.getCstsBySupervisorId(tokenPayload.supervisorId);
  }

  async insertNewCst(tokenPayload: ITokenPayload, payload: IPostCST) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.cstModel.insertCst(
      uuidv4(),
      uuidv4(),
      payload,
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }
}
