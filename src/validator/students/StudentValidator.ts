import Joi from "joi";
import { createErrorObject } from "../../utils";
import {
  IPostStudentPayload,
  IPostStudentResetPasswordPayload,
  IPostStudentTokenResetPassword,
  IPutStudentActiveUnit,
} from "../../utils/interfaces/Student";
import {
  StudentActiveUnitPayloadSchema,
  StudentPayloadSchema,
  StudentResetPasswordPayloadSchema,
  StudentTokenResetPasswordPayloadSchema,
} from "./StudentSchema";

export class StudentPayloadValidator {
  validate(schema: Joi.ObjectSchema, payload: any) {
    const validationResult = schema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validatePostPayload(payload: IPostStudentPayload) {
    const validationResult = StudentPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validateStudentResetPasswordPayload(
    payload: IPostStudentResetPasswordPayload
  ) {
    const validationResult =
      StudentResetPasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validateStudentActiveUnitPayload(payload: IPutStudentActiveUnit) {
    const validationResult = StudentActiveUnitPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }

  validateStudentTokenResetPasswordPayload(
    payload: IPostStudentTokenResetPassword
  ) {
    const validationResult =
      StudentTokenResetPasswordPayloadSchema.validate(payload);

    if (validationResult.error) {
      return createErrorObject(400, validationResult.error.message);
    }

    return null;
  }
}
