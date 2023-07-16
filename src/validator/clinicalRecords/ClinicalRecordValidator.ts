import { createErrorObject } from "../../utils";
import {
  IPostClinicalRecord,
  IPutVerificationStatusClinicalRecord,
} from "../../utils/interfaces/ClinicalRecord";
import {
  ClinicalRecordPayloadSchema,
  ClinicalRecordVerificationStatusSchema,
} from "./ClinicalRecordSchema";

export class ClinicalRecordPayloadValidator {
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
