import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { v4 as uuidv4 } from "uuid";
import { StudentService } from "./StudentService";
import { createErrorObject, getUnixTimestamp } from "../../utils";
import db from "../../database";
import { ProblemConsultation } from "../../models/ProblemConsultation";
import {
  IPostProblemConsultation,
  IPutProblemConsultation,
  IPutProblemConsultationVerificationStatus,
} from "../../utils/interfaces/ProblemConsultation";
import { History } from "../../models/History";


export class ProblemConsultationService {
  private ProblemConsultationModel: ProblemConsultation;
  private studentService: StudentService;
  private historyModel: History;

  constructor() {
    this.ProblemConsultationModel = new ProblemConsultation();
    this.studentService = new StudentService();
    this.historyModel = new History();
  }

  async getProblemConsultationsBySupervisorWithoutPage(
    tokenPayload: ITokenPayload
  ) {
    return {
      data: await this.ProblemConsultationModel.getProblemConsultationsBySupervisorWithoutPage_(
        tokenPayload.supervisorId
      ),
      count:
        await this.ProblemConsultationModel.getProblemConsultationsBySupervisorWithoutPage(
          tokenPayload.supervisorId
        ),
    };
  }

  async updateProblemConsultation(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutProblemConsultation
  ) {
    const ProblemConsultation =
      await this.ProblemConsultationModel.getProblemConsultationsById(id);

    if (!ProblemConsultation) {
      return createErrorObject(404, "problem consultation's not found");
    }

    if (
      ProblemConsultation.studentId !== tokenPayload.studentId &&
      ProblemConsultation?.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      ProblemConsultation?.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      ProblemConsultation?.Student?.academicSupervisorId !==
        tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "not for you");
    }

    return await this.ProblemConsultationModel.updateProblemConsultationById(
      id,
      payload
    );
  }

  async getProblemConsultationById(tokenPayload: ITokenPayload, id: string) {
    const ProblemConsultation =
      await this.ProblemConsultationModel.getProblemConsultationsById(id);

    if (!ProblemConsultation) {
      return createErrorObject(404, "problem consultation's not found");
    }

    if (
      ProblemConsultation.studentId !== tokenPayload.studentId &&
      ProblemConsultation?.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      ProblemConsultation?.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      ProblemConsultation?.Student?.academicSupervisorId !==
        tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "not for you");
    }

    return ProblemConsultation;
  }

  async verifyProblemConsultation(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutProblemConsultationVerificationStatus
  ) {
    const ProblemConsultation =
      await this.ProblemConsultationModel.getProblemConsultationsById(id);

    if (
      ProblemConsultation?.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      ProblemConsultation?.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      ProblemConsultation?.Student?.academicSupervisorId !==
        tokenPayload.supervisorId
    ) {
      return createErrorObject(
        400,
        "you are not authorized to verify this problem consultation"
      );
    }

    return db.$transaction([
      db.problemConsultation.update({
        where: {
          id,
        },
        data: {
          solution: payload.verified,
          verificationStatus: "VERIFIED",
          rating: payload.rating,
        },
      }),
      this.historyModel.insertHistoryAsync(
            "PROBLEM_CONSULTATION",
            getUnixTimestamp(),
            ProblemConsultation?.Student?.id,
            undefined,
            id,
            ProblemConsultation?.Student?.unitId ?? ''
          ),
    ]);
  }

  async getProblemConsultationsByStudentId(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    return this.ProblemConsultationModel.getProblemConsultationsBySupervisorAndStudentId(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async getProblemConsultationsBySupervisor(
    tokenPayload: ITokenPayload,
    page: any,
    take: any,
    search: any,
    name: any,
    nim: any
  ) {
    if (search) {
      return {
        data: await this.ProblemConsultationModel.getProblemConsultationsBySupervisorAndNameOrStudentId(
          tokenPayload.supervisorId,
          page,
          take,
          search
        ),
        count:
          await this.ProblemConsultationModel.getProblemConsultationsBySupervisorWithoutPage(
            tokenPayload.supervisorId
          ),
      };
    }

    if (name || nim) {
      return {
        data: await this.ProblemConsultationModel.getProblemConsultationsBySupervisorAndNameAndStudentId(
          tokenPayload.supervisorId,
          page,
          take,
          name,
          nim
        ),
        count:
          await this.ProblemConsultationModel.getProblemConsultationsBySupervisorWithoutPage(
            tokenPayload.supervisorId
          ),
      };
    }

    return {
      data: await this.ProblemConsultationModel.getProblemConsultationsBySupervisor(
        tokenPayload.supervisorId,
        page,
        take
      ),
      count:
        await this.ProblemConsultationModel.getProblemConsultationsBySupervisorWithoutPage(
          tokenPayload.supervisorId
        ),
    };
  }

  async getProblemConsultationsByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const ProblemConsultations =
      await this.ProblemConsultationModel.getProblemConsultationsByStudentIdAndUnitId(
        tokenPayload.studentId,
        activeUnit?.activeUnit.activeUnit?.id
      );

    return ProblemConsultations;
  }

  async insertNewProblemConsultation(
    tokenPayload: ITokenPayload,
    payload: IPostProblemConsultation
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

    return this.ProblemConsultationModel.insertProblemConsultation(
      uuidv4(),
      payload,
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }
}
