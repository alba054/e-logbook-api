import Joi from "joi";
import { UserPayloadSchema } from "../users/UserSchema";

export const StudentPayloadSchema = UserPayloadSchema.append({
  studentId: Joi.string().required(),
  email: Joi.string()
    .required()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
});

export const StudentResetPasswordPayloadSchema = Joi.object({
  otp: Joi.string().required().min(5).max(5),
  newPassword: Joi.string().required(),
});

export const StudentActiveUnitPayloadSchema = Joi.object({
  unitId: Joi.string().required(),
});

export const StudentTokenResetPasswordPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
});
