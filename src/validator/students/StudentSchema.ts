import Joi from "joi";
import { UserPayloadSchema } from "../users/UserSchema";

export const StudentPayloadSchema = UserPayloadSchema.append({
  studentId: Joi.string().required(),
});

export const StudentResetPasswordPayloadSchema = Joi.object({
  otp: Joi.string().required().min(5).max(5),
  newPassword: Joi.string().required(),
});
