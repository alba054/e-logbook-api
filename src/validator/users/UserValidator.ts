import { createErrorObject } from "../../utils";
import { IPostUserPayload } from "../../utils/interfaces/User";
import { UserRawPayloadSchema } from "./UserSchema";

export class UserPayloadValidator {
  validatePostPayload(payload: IPostUserPayload) {
    const validationResult = UserRawPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
