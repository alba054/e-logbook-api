import { createErrorObject } from "../../utils";
import {
  IPostClinicalRecord,
  IPutFeedbackClinicalRecord,
  IPutVerificationStatusClinicalRecord,
} from "../../utils/interfaces/ClinicalRecord";
import {
  ClinicalRecordFeedbackSchema,
  ClinicalRecordPayloadSchema,
  ClinicalRecordVerificationStatusSchema,
} from "./ClinicalRecordSchema";

export class ClinicalRecordPayloadValidator {
  validatePutFeedbackClinicalRecord(payload: IPutFeedbackClinicalRecord) {
    const validationResult = ClinicalRecordFeedbackSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validatePostPayload(payload: IPostClinicalRecord) {
    const validationResult = ClinicalRecordPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validatePutVerificationStatus(payload: IPutVerificationStatusClinicalRecord) {
    const validationResult =
      ClinicalRecordVerificationStatusSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
