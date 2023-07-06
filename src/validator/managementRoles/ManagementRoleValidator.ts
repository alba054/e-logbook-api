import { createErrorObject } from "../../utils";
import { IPostManagementRolePayload } from "../../utils/interfaces/ManagementRole";
import { ManagementRolePayloadSchema } from "./ManagementRoleSchema";

export class ManagementRoleValidator {
  constructor() {}

  validatePostPayload(payload: IPostManagementRolePayload) {
    const validationResult = ManagementRolePayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
