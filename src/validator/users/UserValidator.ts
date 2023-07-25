import Joi from "joi";
import { createErrorObject } from "../../utils";
import { IPostUserPayload, IPutUserProfile } from "../../utils/interfaces/User";
import { UserRawPayloadSchema } from "./UserSchema";

export class UserPayloadValidator {
  validate(schema: Joi.ObjectSchema, payload: IPutUserProfile) {
    const validationResult = schema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validatePostPayload(payload: IPostUserPayload) {
    const validationResult = UserRawPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
