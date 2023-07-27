import Joi from "joi";
import { createErrorObject } from "../../utils";
import { IPostSelfReflection } from "../../utils/interfaces/SelfReflection";
import { SelfReflectionPayloadSchema } from "./SelfReflectionSchema";

export class SelfReflectionValidator {
  constructor() {}

  validate(schema: Joi.ObjectSchema, payload: any) {
    const validationResult = schema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validatePostPayload(payload: IPostSelfReflection) {
    const validationResult = SelfReflectionPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
