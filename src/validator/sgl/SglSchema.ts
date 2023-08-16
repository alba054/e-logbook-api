import Joi from "joi";

export const SglPayloadSchema = Joi.object({
  supervisorId: Joi.string().required(),
  startTime: Joi.number().required(),
  endTime: Joi.number().required(),
  topicId: Joi.number().required(),
  notes: Joi.string().optional(),
});
