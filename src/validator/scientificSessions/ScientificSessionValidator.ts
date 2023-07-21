import { createErrorObject } from "../../utils";
import {
  IPostScientificSessionPayload,
  IPutVerificationStatusScientificSession,
} from "../../utils/interfaces/ScientificSession";
import {
  ScientificSessionPayloadSchema,
  ScientificSessionVerificationStatusSchema,
} from "./ScientificSessionSchema";

export class ScientificSessionValidator {
  validatePutVerificationStatus(
    payload: IPutVerificationStatusScientificSession
  ) {
    const validationResult =
      ScientificSessionVerificationStatusSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validatePostPayload(payload: IPostScientificSessionPayload) {
    const validationResult = ScientificSessionPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
