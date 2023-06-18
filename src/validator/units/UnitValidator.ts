import { createErrorObject } from "../../utils";
import { IPostUnit } from "../../utils/interfaces/Unit";
import { UnitPayloadSchema } from "./UnitSchema";

export class UnitPayloadValidator {
  constructor() {}

  validatePostPayload(payload: IPostUnit) {
    const validationResult = UnitPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
