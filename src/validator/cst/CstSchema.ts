import Joi from "joi";

export const CstPayloadSchema = Joi.object({
  supervisorId: Joi.string().required(),
  startTime: Joi.number().required(),
  endTime: Joi.number().required(),
  topicId: Joi.array().items(Joi.number()).required().min(1),
  notes: Joi.string().optional(),
});

export const CstTopicVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
});