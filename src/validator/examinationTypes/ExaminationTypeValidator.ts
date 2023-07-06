import { createErrorObject } from "../../utils";
import { IPostExaminationTypePayload } from "../../utils/interfaces/ExaminationType";
import { ExaminationTypePayloadSchema } from "./ExaminationTypeSchema";

export class ExaminationTypeValidator {
  constructor() {}

  validatePostPayload(payload: IPostExaminationTypePayload) {
    const validationResult = ExaminationTypePayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
