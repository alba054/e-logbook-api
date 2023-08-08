import Joi from "joi";

export const CasePayloadSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid("OBTAINED", "OBSERVED", "DISCUSSED"),
});

export const CaseVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
  rating: Joi.number().max(5),
});
