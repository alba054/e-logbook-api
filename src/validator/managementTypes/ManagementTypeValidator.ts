import { createErrorObject } from "../../utils";
import { IPostManagementTypePayload } from "../../utils/interfaces/ManagementType";
import { ManagementTypePayloadSchema } from "./ManagementTypeSchema";

export class ManagementTypeValidator {
  constructor() {}

  validatePostPayload(payload: IPostManagementTypePayload) {
    const validationResult = ManagementTypePayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
