import Joi from "joi";

export const ProblemConsultationPayloadSchema = Joi.object({
  content: Joi.string().required(),
});

export const ProblemConsultationVerificationStatusSchema = Joi.object({
  verified: Joi.string().required(),
  rating: Joi.number().max(5),
  feedback: Joi.string().optional(),
});
