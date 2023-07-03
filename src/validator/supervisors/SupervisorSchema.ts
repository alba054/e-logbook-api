import Joi from "joi";
import { UserPayloadSchema } from "../users/UserSchema";

export const SupervisorPayloadSchema = UserPayloadSchema.append({
  supervisorId: Joi.string().optional(),
  email: Joi.string()
    .optional()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
  badges: Joi.array().items(Joi.number()),
});

export const SupervisorBadgePayloadSchema = Joi.object({
  supervisorId: Joi.string().required(),
  badges: Joi.array().items(Joi.number()).min(1),
});
