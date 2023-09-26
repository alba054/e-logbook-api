import Joi from "joi";

export const CstPayloadSchema = Joi.object({
  supervisorId: Joi.string().required(),
  startTime: Joi.number().required(),
  endTime: Joi.number().required(),
  topicId: Joi.array().items(Joi.number()).required().min(1),
  notes: Joi.string().optional(),
});

export const CstTopicPayloadSchema = Joi.object({
  topicId: Joi.array().items(Joi.number()).required().min(1),
  notes: Joi.string().optional(),
});

export const CstTopicVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
});

export const CstEditPayloadSchema = Joi.object({
  supervisorId: Joi.string().optional(),
  startTime: Joi.number().optional(),
  endTime: Joi.number().optional(),
  notes: Joi.string().optional(),
  topics: Joi.array().items(Joi.object({
    oldId: Joi.string().optional(),
    newId: Joi.number().optional(),
  }))
});

