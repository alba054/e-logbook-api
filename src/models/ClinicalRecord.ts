import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPutVerificationStatusClinicalRecord } from "../utils/interfaces/ClinicalRecord";
import { ITokenPayload } from "../utils/interfaces/TokenPayload";

export class ClinicalRecord {
  async getClinicalRecordsByStudentIdAndUnitId(
    tokenPayload: ITokenPayload,
    unitId?: string
  ) {
    return db.clinicalRecord.findMany({
      where: {
        studentId: tokenPayload.studentId,
        unitId,
      },
      include: {
        supervisor: true,
      },
    });
  }

  async changeVerificationStatusClinicalRecordById(
    id: string,
    payload: IPutVerificationStatusClinicalRecord
  ) {
    try {
      return db.clinicalRecord.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
          supervisorFeedback: payload.supervisorFeedback,
          rating: payload.rating,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to change verification status of clinical record"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getClinicalRecordsById(id: string) {
    return db.clinicalRecord.findUnique({
      where: {
        id,
      },
      include: {
        ClinicalRecordDiagnosis: {
          include: {
            affectedPart: true,
            DiagnosisType: true,
          },
        },
        ClinicalRecordExamination: {
          include: {
            affectedPart: true,
            examinationType: true,
          },
        },
        ClinicalRecordManagement: {
          include: {
            affectedPart: true,
            managementRole: true,
            managementType: true,
          },
        },
      },
    });
  }

  async getClinicalRecordsBySupervisorId(supervisorId?: string) {
    return db.clinicalRecord.findMany({
      where: {
        supervisorId,
      },
      include: {
        Student: true,
      },
    });
  }

  async getClinicalRecordsByStatusAndSupervisorId(
    status: any,
    supervisorId?: string
  ) {
    return db.clinicalRecord.findMany({
      where: {
        verificationStatus: status,
        supervisorId,
      },
      include: {
        Student: true,
      },
    });
  }
}
