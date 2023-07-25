import Joi from "joi";
import { createErrorObject } from "../../utils";
import {
  IPostScientificSessionPayload,
  IPutFeedbackScientificSession,
  IPutVerificationStatusScientificSession,
} from "../../utils/interfaces/ScientificSession";
import {
  ScientificSessionPayloadSchema,
  ScientificSessionVerificationStatusSchema,
} from "./ScientificSessionSchema";

export class ScientificSessionValidator {
  validate(schema: Joi.ObjectSchema, payload: any) {
    const validationResult = schema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

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
