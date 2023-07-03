import Joi from "joi";

export const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const UserRawPayloadSchema = UserPayloadSchema.append({
  role: Joi.string().valid("SUPERVISOR", "STUDENT", "ADMIN").required(),
});
