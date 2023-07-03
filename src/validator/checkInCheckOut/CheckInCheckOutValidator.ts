import { createErrorObject } from "../../utils";
import { CheckInVerificationSchema } from "./CheckInCheckOutSchema";

export class CheckInCheckOutValidator {
  validateCheckInVerificationPayload(payload: { verified: boolean }) {
    const validationResult = CheckInVerificationSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
