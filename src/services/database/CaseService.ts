import {
  IPostCase,
  IPutCaseVerificationStatus,
} from "../../utils/interfaces/Case";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";
import { Case } from "../../models/Case";
import db from "../../database";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createErrorObject } from "../../utils";

export class CaseService {
  private studentService: StudentService;
  private caseModel: Case;

  constructor() {
    this.studentService = new StudentService();
    this.caseModel = new Case();
  }

  async getCasesByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const cases = await this.caseModel.getCasesByStudentIdAndUnitId(
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );

    return cases;
  }

  async verifyCase(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutCaseVerificationStatus
  ) {
    const skill = await this.caseModel.getCaseById(id);

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
      db.case.update({
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

  async verifyAllStudentCases(tokenPayload: ITokenPayload, studentId: string) {
    try {
      return db.$transaction([
        db.case.updateMany({
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
          },
          data: {
            verificationStatus: "VERIFIED",
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

  async getCaseByStudentId(tokenPayload: ITokenPayload, studentId: string) {
    return this.caseModel.getCasesBySupervisorAndStudentId(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async getCasesBySupervisor(tokenPayload: ITokenPayload) {
    return this.caseModel.getCasesBySupervisor(tokenPayload.supervisorId);
  }

  async insertNewCase(tokenPayload: ITokenPayload, payload: IPostCase) {
    const studentActiveUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.caseModel.insertNewCase(
      uuidv4(),
      payload,
      tokenPayload.studentId,
      studentActiveUnit?.activeUnit.activeUnit?.id
    );
  }
}
