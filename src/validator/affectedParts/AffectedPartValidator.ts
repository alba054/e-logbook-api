import { createErrorObject } from "../../utils";
import { IPostAffectedPartPayload } from "../../utils/interfaces/AffectedPart";
import { AffectedPartPayloadSchema } from "./AffectedPartSchema";

export class AffectedPartValidator {
  constructor() {}

  validatePostPayload(payload: IPostAffectedPartPayload) {
    const validationResult = AffectedPartPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
