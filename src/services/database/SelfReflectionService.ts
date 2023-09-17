import { SelfReflection } from "../../models/SelfReflection";
import {
  IPostSelfReflection,
  IPutSelfReflection,
  IPutSelfReflectionVerificationStatus,
} from "../../utils/interfaces/SelfReflection";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { v4 as uuidv4 } from "uuid";
import { StudentService } from "./StudentService";
import { createErrorObject } from "../../utils";
import db from "../../database";

export class SelfReflectionService {
  private selfReflectionModel: SelfReflection;
  private studentService: StudentService;

  constructor() {
    this.selfReflectionModel = new SelfReflection();
    this.studentService = new StudentService();
  }

  async updateSelfReflection(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutSelfReflection
  ) {
    const selfReflection =
      await this.selfReflectionModel.getSelfReflectionsById(id);

    if (!selfReflection) {
      return createErrorObject(404, "self reflection's not found");
    }

    if (
      selfReflection.studentId !== tokenPayload.studentId &&
      selfReflection?.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      selfReflection?.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      selfReflection?.Student?.academicSupervisorId !==
        tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "not for you");
    }

    return await this.selfReflectionModel.updateSelfReflectionById(id, payload);
  }

  async getSelfReflectionById(tokenPayload: ITokenPayload, id: string) {
    const selfReflection =
      await this.selfReflectionModel.getSelfReflectionsById(id);

    if (!selfReflection) {
      return createErrorObject(404, "self reflection's not found");
    }

    if (
      selfReflection.studentId !== tokenPayload.studentId &&
      selfReflection?.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      selfReflection?.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      selfReflection?.Student?.academicSupervisorId !==
        tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "not for you");
    }

    return selfReflection;
  }

  async verifySelfReflection(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutSelfReflectionVerificationStatus
  ) {
    const selfReflection =
      await this.selfReflectionModel.getSelfReflectionsById(id);

    if (
      selfReflection?.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      selfReflection?.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      selfReflection?.Student?.academicSupervisorId !==
        tokenPayload.supervisorId
    ) {
      return createErrorObject(
        400,
        "you are not authorized to verify this self reflection"
      );
    }

    return db.$transaction([
      db.selfReflection.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
          rating: payload.rating,
          supervisorFeedback: payload.feedback,
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: selfReflection?.unitId ?? "",
          studentId: selfReflection?.studentId ?? "",
        },
        data: {
          selfReflectionDone: payload.verified,
        },
      }),
    ]);
  }

  async getSelfReflectionsByStudentId(
    tokenPayload: ITokenPayload,
    studentId: string,
    activeUnit?: string
  ) {
    return this.selfReflectionModel.getSelfReflectionsBySupervisorAndStudentId(
      tokenPayload.supervisorId,
      studentId,
      activeUnit
    );
  }

  async getSelfReflectionsBySupervisor(
    tokenPayload: ITokenPayload,
    page: any,
    take: any,
    search: any,
    name: any,
    nim: any
  ) {
    if (search) {
      return {
        data: await this.selfReflectionModel.getSelfReflectionsBySupervisorAndNameOrStudentId(
          tokenPayload.supervisorId,
          page,
          take,
          search
        ),
        count:
          await this.selfReflectionModel.getSelfReflectionsBySupervisorWithoutPage(
            tokenPayload.supervisorId
          ),
      };
    }

    if (name || nim) {
      return {
        data: await this.selfReflectionModel.getSelfReflectionsBySupervisorAndNameAndStudentId(
          tokenPayload.supervisorId,
          page,
          take,
          name,
          nim
        ),
        count:
          await this.selfReflectionModel.getSelfReflectionsBySupervisorWithoutPage(
            tokenPayload.supervisorId
          ),
      };
    }

    return {
      data: await this.selfReflectionModel.getSelfReflectionsBySupervisor(
        tokenPayload.supervisorId
      ),
      count:
        await this.selfReflectionModel.getSelfReflectionsBySupervisorWithoutPage(
          tokenPayload.supervisorId
        ),
    };
  }

  async getSelfReflectionsByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const selfReflections =
      await this.selfReflectionModel.getSelfReflectionsByStudentIdAndUnitId(
        tokenPayload.studentId,
        activeUnit?.activeUnit.activeUnit?.id
      );

    return selfReflections;
  }

  async insertNewSelfReflection(
    tokenPayload: ITokenPayload,
    payload: IPostSelfReflection
  ) {
    const student = await this.studentService.getStudentById(
      tokenPayload.studentId
    );

    if (
      !student?.academicSupervisorId &&
      !student?.supervisingSupervisorId &&
      !student?.examinerSupervisorId
    ) {
      return createErrorObject(400, "you have no assigned supervisor or dpk");
    }

    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.selfReflectionModel.insertSelfReflection(
      uuidv4(),
      payload,
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }
}
