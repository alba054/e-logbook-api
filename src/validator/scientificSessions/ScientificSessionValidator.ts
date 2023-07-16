import { createErrorObject } from "../../utils";
import { IPostScientificSessionPayload } from "../../utils/interfaces/ScientificSession";
import { ScientificSessionPayloadSchema } from "./ScientificSessionSchema";

export class ScientificSessionValidator {
  validatePostPayload(payload: IPostScientificSessionPayload) {
    const validationResult = ScientificSessionPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
