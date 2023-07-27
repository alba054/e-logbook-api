import Joi from "joi";

export const SelfReflectionPayloadSchema = Joi.object({
  content: Joi.string().required(),
});

export const SelfReflectionVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
  rating: Joi.number().max(5),
});
