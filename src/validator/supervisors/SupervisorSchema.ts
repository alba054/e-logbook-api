import Joi from "joi";
import { UserPayloadSchema } from "../users/UserSchema";

export const SupervisorPayloadSchema = UserPayloadSchema.append({
  supervisorId: Joi.string().optional(),
  email: Joi.string()
    .optional()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  badges: Joi.array().items(Joi.number()).optional(),
  roles: Joi.string().valid("DPK", "SUPERVISOR", "ER").required(),
  placeOfBirth: Joi.string().optional(),
  dateOfBirth: Joi.number().optional(),
  address: Joi.string().optional(),
  gender: Joi.string().valid("MALE", "FEMALE").optional(),
  location: Joi.array().items(Joi.number()).optional(),
  units: Joi.array().items(Joi.string()).optional(),
  headDivUnit: Joi.string().optional(),
});

export const SupervisorBadgePayloadSchema = Joi.object({
  supervisorId: Joi.string().required(),
  badges: Joi.array().items(Joi.number()).min(1),
});
