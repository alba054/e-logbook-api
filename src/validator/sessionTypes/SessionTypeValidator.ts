import Joi from "joi";
import { createErrorObject } from "../../utils";
import { IPostUnit } from "../../utils/interfaces/Unit";

export class SessionTypeValidator {
  constructor() {}

  validate(schema: Joi.ObjectSchema, payload: any) {
    const validationResult = schema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
