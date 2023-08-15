import Joi from "joi";

export const SkillPayloadSchema = Joi.object({
  type: Joi.string().valid("OBTAINED", "OBSERVED", "DISCUSSED"),
  skillTypeId: Joi.number().required(),
});

export const SkillVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
  rating: Joi.number().max(5),
});
