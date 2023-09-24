import Joi from "joi";

export const ScientificSessionPayloadSchema = Joi.object({
  notes: Joi.string().optional(),
  attachment: Joi.string().optional(),
  supervisorId: Joi.string().required(),
  sessionType: Joi.number().required(),
  topic: Joi.string().required(),
  title: Joi.string().required(),
  reference: Joi.string().optional(),
  role: Joi.number().required(),
});

export const ScientificSessionVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
  rating: Joi.number().max(5),
});

export const ScientificSessionFeedbackSchema = Joi.object({
  feedback: Joi.string().required(),
});
