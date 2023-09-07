import Joi from "joi";

export const SkillPayloadSchema = Joi.object({
  type: Joi.string().valid("OBSERVER", "PERFORM"),
  skillTypeId: Joi.number().required(),
  supervisorId: Joi.string().required(),
});

export const SkillVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
  rating: Joi.number().max(5),
});
