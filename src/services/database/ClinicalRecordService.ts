import db from "../../database";
import {
  IPostClinicalRecord,
  IPutFeedbackClinicalRecord,
  IPutVerificationStatusClinicalRecord,
} from "../../utils/interfaces/ClinicalRecord";
import { v4 as uuidv4 } from "uuid";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { constants, createErrorObject, getUnixTimestamp } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { ClinicalRecord } from "../../models/ClinicalRecord";
import { History } from "../../models/History";

export class ClinicalRecordService {
  private studentService: StudentService;
  private clinicalRecordModel: ClinicalRecord;
  private historyModel: History;

  constructor() {
    this.studentService = new StudentService();
    this.clinicalRecordModel = new ClinicalRecord();
    this.historyModel = new History();
  }

  async getSubmittedClinicalRecordsWithoutPage(
    supervisorId: string | undefined
  ) {
    return {
      data: await this.clinicalRecordModel.getClinicalRecordsBySupervisorId(
        supervisorId
      ),
      count: (
        await this.clinicalRecordModel.getClinicalRecordsBySupervisorId(
          supervisorId
        )
      ).length,
    };
  }

  async giveFeedbackToClinicalRecord(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutFeedbackClinicalRecord
  ) {
    const clinicalRecord =
      await this.clinicalRecordModel.getClinicalRecordsById(id);

    if (!clinicalRecord) {
      return createErrorObject(404, "clinical record's not found");
    }

    if (
      clinicalRecord.supervisorId !== tokenPayload.supervisorId &&
      clinicalRecord.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "clinical record's not for you");
    }

    if (tokenPayload.studentId) {
      return this.clinicalRecordModel.insertStudentFeedback(
        id,
        payload.feedback
      );
    } else if (tokenPayload.supervisorId) {
      return this.clinicalRecordModel.insertSupervisorFeedback(
        id,
        payload.feedback
      );
    }

    return null;
  }

  async getClinicalRecordsByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const clinicalRecords =
      await this.clinicalRecordModel.getClinicalRecordsByStudentIdAndUnitId(
        tokenPayload,
        activeUnit?.activeUnit.activeUnit?.id
      );

    return {
      clinicalRecords,
      verifiedCounts: clinicalRecords.filter(
        (c) => c.verificationStatus === "VERIFIED"
      ).length,
      unverifiedCounts: clinicalRecords.filter(
        (c) =>
          c.verificationStatus === "UNVERIFIED" ||
          c.verificationStatus === "INPROCESS"
      ).length,
    };
  }

  async verifyClinicalRecord(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutVerificationStatusClinicalRecord
  ) {
    const clinicalRecord =
      await this.clinicalRecordModel.getClinicalRecordsById(id);

    if (!clinicalRecord) {
      return createErrorObject(404, "clinical record's not found");
    }

    if (
      clinicalRecord.supervisorId !== tokenPayload.supervisorId &&
      clinicalRecord.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "clinical record's not for you");
    }

    return db.$transaction([
      db.clinicalRecord.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
          supervisorFeedback: payload.supervisorFeedback,
          rating: payload.rating,
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: clinicalRecord.unitId ?? "",
          studentId: clinicalRecord.studentId ?? "",
        },
        data: {
          clinicalRecordDone: payload.verified,
        },
      }),
    ]);

    // return this.clinicalRecordModel.changeVerificationStatusClinicalRecordById(
    //   id,
    //   payload
    // );
  }

  async getClinicalRecordDetail(id: string, tokenPayload: ITokenPayload) {
    const clinicalRecord =
      await this.clinicalRecordModel.getClinicalRecordsById(id);

    if (!clinicalRecord) {
      return createErrorObject(404, "clinical record's not found");
    }

    if (
      clinicalRecord.supervisorId !== tokenPayload.supervisorId &&
      clinicalRecord.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "clinical record's not for you");
    }

    return clinicalRecord;
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

  async getSubmittedClinicalRecords(
    status: any,
    page: any,
    offset: any = constants.HISTORY_ELEMENTS_PER_PAGE,
    patient: any,
    name: any,
    nim: any,
    sort: any,
    order: any,
    supervisorId?: string | undefined
  ) {
    if (status || patient || name || nim || sort) {
      return {
        data: await this.clinicalRecordModel.getClinicalRecordsByStatusAndSupervisorId(
          status,
          page,
          offset,
          patient,
          name,
          nim,
          sort,
          order,
          supervisorId
        ),
        count: (
          await this.clinicalRecordModel.getClinicalRecordsBySupervisorId(
            supervisorId
          )
        ).length,
      };
    }

    return {
      data: await this.clinicalRecordModel.getClinicalRecordsBySupervisorId(
        supervisorId
      ),
      count: (
        await this.clinicalRecordModel.getClinicalRecordsBySupervisorId(
          supervisorId
        )
      ).length,
    };
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
        if (payload.diagnosiss[i].diagnosisTypeId.length > 0) {
          for (
            let j = 0;
            j < payload.diagnosiss[i].diagnosisTypeId.length;
            j++
          ) {
            diagnosiss.push(
              db.clinicalRecordDiagnosis.create({
                data: {
                  DiagnosisTypeId: payload.diagnosiss[i].diagnosisTypeId[j],
                  clinicalRecordId: clinicalRecordId,
                },
              })
            );
          }
        } else {
          for (
            let j = 0;
            j < payload.diagnosiss[i].diagnosesTypeId.length;
            j++
          ) {
            diagnosiss.push(
              db.clinicalRecordDiagnosis.create({
                data: {
                  DiagnosisTypeId: payload.diagnosiss[i].diagnosesTypeId[j],
                  clinicalRecordId: clinicalRecordId,
                },
              })
            );
          }
        }
      }

      // * examinations
      for (let i = 0; i < payload.examinations?.length; i++) {
        for (
          let j = 0;
          j < payload.examinations[i].examinationTypeId.length;
          j++
        ) {
          examinations.push(
            db.clinicalRecordExamination.create({
              data: {
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
        this.historyModel.insertHistoryAsync(
          "CLINICAL_RECORD",
          getUnixTimestamp(),
          tokenPayload.studentId,
          payload.supervisorId,
          clinicalRecordId,
          studentActiveUnit?.activeUnit.activeUnit?.id
        ),
      ]);
    } catch (error) {
      console.log(error);

      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, error.message);
      } else {
        return createErrorObject(500);
      }
    }
    //   // return this.clinicalRecordModel.insertNewClinicalRecord(payload);
  }
}
