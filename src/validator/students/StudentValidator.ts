import {
  IPostStudentPayload,
  IPostStudentResetPasswordPayload,
} from "../../utils/interfaces/Student";
import {
  StudentPayloadSchema,
  StudentResetPasswordPayloadSchema,
} from "./StudentSchema";

export class StudentPayloadValidator {
  validatePostPayload(payload: IPostStudentPayload) {
    const validationResult = StudentPayloadSchema.validate(payload);

    if (validationResult.error) {
      return { error: validationResult.error };
    }

    return null;
  }

  validateStudentResetPasswordPayload(
    payload: IPostStudentResetPasswordPayload
  ) {
    const validationResult =
      StudentResetPasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      return { error: validationResult.error };
    }

    return null;
  }
}
