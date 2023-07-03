import { createErrorObject } from "../../utils";
import {
  IPostSupervisorBadgePayload,
  IPostSupervisorPayload,
} from "../../utils/interfaces/Supervisor";
import {
  SupervisorBadgePayloadSchema,
  SupervisorPayloadSchema,
} from "./SupervisorSchema";

export class SupervisorPayloadValidator {
  validatePostPayload(payload: IPostSupervisorPayload) {
    const validationResult = SupervisorPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validatePostSupervisorBadgePayload(payload: IPostSupervisorBadgePayload) {
    const validationResult = SupervisorBadgePayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
