import Joi from "joi";

export const SkillPayloadSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid("OBTAINED", "OBSERVED", "DISCUSSED"),
});

export const SkillVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
  rating: Joi.number().max(5),
});
