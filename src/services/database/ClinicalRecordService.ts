import db from "../../database";
import { IPostClinicalRecord } from "../../utils/interfaces/ClinicalRecord";
import { v4 as uuidv4 } from "uuid";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createErrorObject } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { ClinicalRecord } from "../../models/ClinicalRecord";

export class ClinicalRecordService {
  private studentService: StudentService;
  private clinicalRecordModel: ClinicalRecord;

  constructor() {
    this.studentService = new StudentService();
    this.clinicalRecordModel = new ClinicalRecord();
  }

  async getAttachmentByClinicalRecordId(
    id: string,
    tokenPayload: ITokenPayload
  ) {
    const clinicalRecord =
      await this.clinicalRecordModel.getClinicalRecordsById(id);

    if (
      clinicalRecord?.supervisorId !== tokenPayload.supervisorId &&
      clinicalRecord?.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "this attachment is not for you");
    }

    if (!clinicalRecord?.attachment) {
      return createErrorObject(404, "attachment's not found");
    }

    return clinicalRecord.attachment;
  }

  async getSubmittedClinicalRecords(status: any, supervisorId?: string) {
    if (status) {
      return this.clinicalRecordModel.getClinicalRecordsByStatusAndSupervisorId(
        status,
        supervisorId
      );
    }

    return this.clinicalRecordModel.getClinicalRecordsBySupervisorId(
      supervisorId
    );
  }

  async insertNewClinicalRecord(
    tokenPayload: ITokenPayload,
    payload: IPostClinicalRecord
  ) {
    try {
      const studentActiveUnit = await this.studentService.getActiveUnit(
        tokenPayload.studentId ?? ""
      );

      const examinations = [];
      const diagnosiss = [];
      const managements = [];
      const clinicalRecordId = uuidv4();
      const clinicalRecordOp = db.clinicalRecord.create({
        data: {
          gender: payload.gender,
          patientAge: payload.patientAge,
          patientName: payload.patientName,
          attachment: payload.attachment,
          notes: payload.notes,
          recordId: payload.recordId,
          studentFeedback: payload.studentFeedback,
          unitId: studentActiveUnit?.activeUnit.activeUnit?.id,
          studentId: tokenPayload.studentId,
          id: clinicalRecordId,
          supervisorId: payload.supervisorId,
        },
      });

      // * diagnosis
      for (let i = 0; i < payload.diagnosiss?.length; i++) {
        for (let j = 0; j < payload.diagnosiss[i].diagnosisTypeId.length; j++) {
          diagnosiss.push(
            db.clinicalRecordDiagnosis.create({
              data: {
                affectedPartId: payload.diagnosiss[i].affectedPartId,
                DiagnosisTypeId: payload.diagnosiss[i].diagnosisTypeId[j],
                clinicalRecordId: clinicalRecordId,
              },
            })
          );
        }
      }

      // * examifileToSend && "error" in fileToSendnations
      for (let i = 0; i < payload.examinations?.length; i++) {
        for (
          let j = 0;
          j < payload.examinations[i].examinationTypeId.length;
          j++
        ) {
          examinations.push(
            db.clinicalRecordExamination.create({
              data: {
                affectedPartId: payload.examinations[i].affectedPartId,
                examinationTypeId: payload.examinations[i].examinationTypeId[j],
                clinicalRecordId: clinicalRecordId,
              },
            })
          );
        }
      }

      // * managements
      for (let i = 0; i < payload.managements?.length; i++) {
        for (let j = 0; j < payload.managements[i].management.length; j++) {
          managements.push(
            db.clinicalRecordManagement.create({
              data: {
                affectedPartId: payload.managements[i].affectedPartId,
                managementTypeId:
                  payload.managements[i].management[j].managementTypeId,
                managementRoleId:
                  payload.managements[i].management[j].managementRoleId,
                clinicalRecordId: clinicalRecordId,
              },
            })
          );
        }
      }

      await db.$transaction([
        clinicalRecordOp,
        ...examinations,
        ...diagnosiss,
        ...managements,
      ]);
    } catch (error) {
      console.log(error);

      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new clinical record");
      } else {
        return createErrorObject(500);
      }
    }
    //   // return this.clinicalRecordModel.insertNewClinicalRecord(payload);
  }
}
