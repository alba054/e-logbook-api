import Joi from "joi";

export const ScientificSessionPayloadSchema = Joi.object({
  notes: Joi.string().optional(),
  attachment: Joi.string().optional(),
  supervisorId: Joi.string().required(),
  sessionType: Joi.string().required(),
  topic: Joi.string().required(),
  title: Joi.string().required(),
  reference: Joi.string().required(),
  role: Joi.string().required(),
});
