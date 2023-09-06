import Joi from "joi";

export const CasePayloadSchema = Joi.object({
  type: Joi.string().valid("OBTAINED", "OBSERVED", "DISCUSSED"),
  caseTypeId: Joi.number().required(),
  supervisorId: Joi.string().required(),
});

export const CaseVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
  rating: Joi.number().max(5),
});
