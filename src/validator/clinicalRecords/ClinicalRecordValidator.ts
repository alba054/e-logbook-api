import { createErrorObject } from "../../utils";
import { IPostClinicalRecord } from "../../utils/interfaces/ClinicalRecord";
import { ClinicalRecordPayloadSchema } from "./ClinicalRecordSchema";

export class ClinicalRecordPayloadValidator {
  validatePostPayload(payload: IPostClinicalRecord) {
    const validationResult = ClinicalRecordPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
