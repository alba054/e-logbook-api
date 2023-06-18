import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { IPostClinicalRecord } from "../utils/interfaces/ClinicalRecord";
import { createErrorObject } from "../utils";
import db from "../database";

export class ClinicalRecord {
  constructor() {}

  async insertNewClinicalRecord(payload: IPostClinicalRecord) {
    try {
      // return db.clinicalRecord.create({
      //   data: {
      //     gender: payload.gender,
      //     patientAge: payload.patientAge,
      //     patientName: payload.patientName,
      //     attachment: payload.attachment,
      //     notes: payload.notes,
      //     recordId: payload.recordId,
      //     studentFeedback: payload.studentFeedback,
      //     unitId: payload.unitId,
      //     ClinicalRecordDiagnosis: {
      //       createMany: {
      //         data: payload.diagnosiss.map((d) => {
      //           return {
      //             affectedPartId: d.affectedPartId,
      //             diagnosisTypeId: d.diagnosisTypeId,
      //           };
      //         }),
      //       },
      //     },
      //   },
      // });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new clinical record");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
