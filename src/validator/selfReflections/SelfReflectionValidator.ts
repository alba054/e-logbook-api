import { createErrorObject } from "../../utils";
import { IPostSelfReflection } from "../../utils/interfaces/SelfReflection";
import { SelfReflectionPayloadSchema } from "./SelfReflectionSchema";

export class SelfReflectionValidator {
  constructor() {}

  validatePostPayload(payload: IPostSelfReflection) {
    const validationResult = SelfReflectionPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
