import { createErrorObject } from "../../utils";
import { IPostDiagnosisTypePayload } from "../../utils/interfaces/DiagnosisType";
import { DiagnosisTypePayloadSchema } from "./DiagnosisTypeSchema";

export class DiagnosisTypeValidator {
  constructor() {}

  validatePostPayload(payload: IPostDiagnosisTypePayload) {
    const validationResult = DiagnosisTypePayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
