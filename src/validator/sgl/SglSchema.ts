import Joi from "joi";

export const SglPayloadSchema = Joi.object({
  supervisorId: Joi.string().required(),
  startTime: Joi.number().required(),
  endTime: Joi.number().required(),
  topicId: Joi.array().items(Joi.number()).required().min(1),
  notes: Joi.string().optional(),
});

export const SglEditPayloadSchema = Joi.object({
  supervisorId: Joi.string().optional(),
  startTime: Joi.number().optional(),
  endTime: Joi.number().optional(),
  notes: Joi.string().optional(),
});

export const SglEditTopicPayloadSchema = Joi.object({
  topicId: Joi.number().required()
});

export const SglTopicPayloadSchema = Joi.object({
  topicId: Joi.array().items(Joi.number()).required().min(1),
  notes: Joi.string().optional(),
});

export const SglTopicVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
});
