import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";
import { constants, createErrorObject, getUnixTimestamp } from "../../utils";
import db from "../../database";
import {
  IPostCST,
  IPostCSTTopic,
  IPutCST,
  IPutCstTopicVerificationStatus,
} from "../../utils/interfaces/Cst";
import { Cst } from "../../models/Cst";
import { History } from "../../models/History";


export class CstService {
  private studentService: StudentService;
  private cstModel: Cst;
  private historyModel: History;


  constructor() {
    this.studentService = new StudentService();
    this.cstModel = new Cst();
    this.historyModel = new History();
  }

  async deleteSglById(id: string, tokenPayload: ITokenPayload) {
     const cst = await this.cstModel.getCstById(id);

    if (!cst) {
      return createErrorObject(404, "cst's not found");
    }

    if (cst.studentId !== tokenPayload.studentId) {
      return createErrorObject(400, "data's not for you");
    }

    return this.cstModel.deleteCstById(id);
  }
  
  async editCstById(id: string, tokenPayload: ITokenPayload, payload: IPutCST) {
    const cst = await this.cstModel.getCstById(id);

     if (!cst) {
      return createErrorObject(404, "cst topic's not found");
    }

    if (cst?.studentId !== tokenPayload.studentId) {
      return createErrorObject(
        400,
        "you are not authorized to verify this sgl"
      );
    }

    return this.cstModel.ediCstById(id, payload);
  }

  async getCstsBySupervisorWithoutPage(tokenPayload: ITokenPayload) {
    if (tokenPayload.badges?.includes(constants.CEU_BADGE)) {
      return this.cstModel.getCstsWithoutPage();
    }
    return this.cstModel.getCstsBySupervisorIdWithoutPage(
      tokenPayload.supervisorId
    );
  }

  async verifyAllCstTopics(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutCstTopicVerificationStatus
  ) {
    const cst = await this.cstModel.getCstById(id);

    if (!cst) {
      return createErrorObject(404, "cst topic's not found");
    }

    if (cst?.supervisorId !== tokenPayload.supervisorId) {
      return createErrorObject(
        400,
        "you are not authorized to verify this cst"
      );
    }

    return db.$transaction([
      ...cst.topics.map((t) => {
        return db.cstTopic.update({
          where: {
            id: t.id,
          },
          data: {
            verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
          },
        });
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: cst.unitId ?? "",
          studentId: cst.studentId ?? "",
        },
        data: {
          cstDone: payload.verified,
        },
      }),

    ]);
  }

  async getCstsByStudentIdAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.cstModel.getCstByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }

  async addTopicToCst(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPostCSTTopic
  ) {
    const sgl = await this.cstModel.getCstById(id);

    if (!sgl) {
      return createErrorObject(404, "cst's not found");
    }

    if (sgl.studentId !== tokenPayload.studentId) {
      return createErrorObject(400, "data's not for you");
    }

    return this.cstModel.addTopicToCstById(id, uuidv4(), payload);
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
      this.historyModel.insertHistoryAsync(
          "CST",
          getUnixTimestamp(),
          Cst?.studentId ?? '',
          Cst?.supervisorId ?? '',
          id,
          Cst?.unitId?? ''
        ),
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

    if (CstTopic?.CST[0]?.supervisorId !== tokenPayload.supervisorId) {
      return createErrorObject(
        400,
        "you are not authorized to verify this Cst"
      );
    }

    return db.$transaction([
      db.cstTopic.update({
        where: {
          id: topicId,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: CstTopic.CST[0]?.unitId ?? "",
          studentId: CstTopic.CST[0]?.studentId ?? "",
        },
        data: {
          cstDone: payload.verified,
        },
      }),
    ]);
    // return this.cstModel.verifyCstTopicById(topicId, payload);
  }

  async getCstsBySupervisorAndStudentId(
    tokenPayload: ITokenPayload,
    studentId: string,
    activeUnit?: string
  ) {
    if (tokenPayload.badges?.includes(constants.CEU_BADGE)) {
      return this.cstModel.getCstsByStudentId(studentId, activeUnit);
    }

    return this.cstModel.getCstsBySupervisorIdAndStudentId(
      tokenPayload.supervisorId,
      studentId,
      activeUnit
    );
  }

  async getCstsBySupervisor(
    tokenPayload: ITokenPayload,
    name: any,
    nim: any,
    page: any,
    take: any
  ) {
    if (tokenPayload.badges?.includes(constants.CEU_BADGE)) {
      return this.cstModel.getCsts(name, nim, page, take);
    }
    return this.cstModel.getCstsBySupervisorId(
      tokenPayload.supervisorId,
      name,
      nim,
      page,
      take
    );
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
