import { Sgl } from "../../models/Sgl";
import {
  IPostSGL,
  IPostSGLTopic,
  IPutSglTopicVerificationStatus,
} from "../../utils/interfaces/Sgl";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";
import { constants, createErrorObject } from "../../utils";
import db from "../../database";

export class SglService {
  private studentService: StudentService;
  private sglModel: Sgl;

  constructor() {
    this.studentService = new StudentService();
    this.sglModel = new Sgl();
  }

  async getSglsBySupervisorWithoutPage(
    tokenPayload: ITokenPayload,
    unit?: string | undefined
  ) {
    if (tokenPayload.badges?.includes(constants.CEU_BADGE)) {
      return this.sglModel.getSglsWithoutPage(unit);
    }
    return this.sglModel.getSglsBySupervisorIdWithoutPage(
      tokenPayload.supervisorId,
      unit
    );
  }

  async verifyAllSglTopics(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutSglTopicVerificationStatus
  ) {
    const sgl = await this.sglModel.getSglById(id);

    if (!sgl) {
      return createErrorObject(404, "sgl topic's not found");
    }

    if (sgl?.supervisorId !== tokenPayload.supervisorId) {
      return createErrorObject(
        400,
        "you are not authorized to verify this sgl"
      );
    }

    return db.$transaction([
      ...sgl.topics.map((t) => {
        return db.sglTopic.update({
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
          unitId: sgl?.unitId ?? "",
          studentId: sgl?.studentId ?? "",
        },
        data: {
          sglDone: payload.verified,
        },
      }),
    ]);
  }

  async getSglsByStudentIdAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.sglModel.getSglsByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }

  async addTopicToSgl(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPostSGLTopic
  ) {
    const sgl = await this.sglModel.getSglById(id);

    if (!sgl) {
      return createErrorObject(404, "sgl's not found");
    }

    if (sgl.studentId !== tokenPayload.studentId) {
      return createErrorObject(400, "data's not for you");
    }

    return this.sglModel.addTopicToSglById(id, uuidv4(), payload);
  }

  async verifySgl(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutSglTopicVerificationStatus
  ) {
    const sgl = await this.sglModel.getSglById(id);

    if (!sgl) {
      return createErrorObject(404, "sgl topic's not found");
    }

    if (!sgl.topics.every((s) => s.verificationStatus === "VERIFIED")) {
      return createErrorObject(
        400,
        "sgl is not ready to verified because some topics are unverified"
      );
    }

    return db.$transaction([
      db.sGL.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: sgl?.unitId ?? "",
          studentId: sgl?.studentId ?? "",
        },
        data: {
          sglDone: payload.verified,
        },
      }),
    ]);
  }

  async verifySglTopic(
    topicId: string,
    tokenPayload: ITokenPayload,
    payload: IPutSglTopicVerificationStatus
  ) {
    const sglTopic = await this.sglModel.getSglTopicById(topicId);

    if (!sglTopic) {
      return createErrorObject(404, "sgl topic's not found");
    }

    if (sglTopic?.SGL?.supervisorId !== tokenPayload.supervisorId) {
      return createErrorObject(
        400,
        "you are not authorized to verify this sgl"
      );
    }

    return db.$transaction([
      db.sglTopic.update({
        where: {
          id: topicId,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: sglTopic?.SGL?.unitId ?? "",
          studentId: sglTopic?.SGL?.studentId ?? "",
        },
        data: {
          sglDone: payload.verified,
        },
      }),
    ]);

    // return this.sglModel.verifySglTopicById(topicId, payload);
  }

  async getSglsBySupervisorAndStudentId(
    tokenPayload: ITokenPayload,
    studentId: string,
    activeUnit?: string
  ) {
    if (tokenPayload.badges?.includes(constants.CEU_BADGE)) {
      return this.sglModel.getSglsByStudentId(studentId, activeUnit);
    }

    return this.sglModel.getSglsBySupervisorIdAndStudentId(
      tokenPayload.supervisorId,
      studentId,
      activeUnit
    );
  }

  async getSglsBySupervisor(
    tokenPayload: ITokenPayload,
    name: any,
    nim: any,
    page: any,
    take: any,
    unit?: string | undefined
  ) {
    if (tokenPayload.badges?.includes(constants.CEU_BADGE)) {
      return this.sglModel.getSgls(name, nim, page, take, unit);
    }
    return this.sglModel.getSglsBySupervisorId(
      tokenPayload.supervisorId,
      name,
      nim,
      page,
      take,
      unit
    );
  }

  async insertNewSgl(tokenPayload: ITokenPayload, payload: IPostSGL) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.sglModel.insertSgl(
      uuidv4(),
      uuidv4(),
      payload,
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }
}
