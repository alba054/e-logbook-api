import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { constants, createErrorObject } from "../utils";
import { IPutVerificationStatusClinicalRecord } from "../utils/interfaces/ClinicalRecord";
import { ITokenPayload } from "../utils/interfaces/TokenPayload";

export class ClinicalRecord {
  async insertSupervisorFeedback(id: string, feedback: string) {
    try {
      return db.clinicalRecord.update({
        where: {
          id,
        },
        data: {
          supervisorFeedback: feedback,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert supervisor feedback");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertStudentFeedback(id: string, feedback: string) {
    try {
      return db.clinicalRecord.update({
        where: {
          id,
        },
        data: {
          studentFeedback: feedback,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert student feedback");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getClinicalRecordsByStudentIdAndUnitId(
    tokenPayload: ITokenPayload,
    unitId?: string
  ) {
    return db.clinicalRecord.findMany({
      where: {
        studentId:
          tokenPayload.studentId === null ? undefined : tokenPayload.studentId,
        unitId: unitId === null ? undefined : unitId,
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
            DiagnosisType: true,
          },
        },
        ClinicalRecordExamination: {
          include: {
            examinationType: true,
          },
        },
        ClinicalRecordManagement: {
          include: {
            managementRole: true,
            managementType: true,
          },
        },
        Student: true,
        supervisor: true,
        Unit: true,
      },
    });
  }

  async getClinicalRecordsBySupervisorId(supervisorId?: string) {
    return db.clinicalRecord.findMany({
      where: {
        supervisorId: supervisorId === null ? undefined : supervisorId,
        
      },
      include: {
        Student: true,
        Unit: true,
      },
    });
  }

  async getClinicalRecordsByStatusAndSupervisorId(
    status: any,
    page: any = 1,
    offset: any,
    patient: any,
    name: any,
    nim: any,
    sort: any,
    order: "asc" | "desc",
    supervisorId?: string
  ) {
    return db.clinicalRecord.findMany({
      where: {
        verificationStatus: status,
        Student: {
          fullName: { contains: name },
          studentId: nim,
        },
        patientName: patient,
        supervisorId: supervisorId === null ? undefined : supervisorId,
      },
      include: {
        Student: true,
        Unit: true,
      },
      take: offset,
      skip: offset * (page - 1),
    });
  }
}
