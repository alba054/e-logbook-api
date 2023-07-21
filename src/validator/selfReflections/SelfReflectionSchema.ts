import Joi from "joi";

export const SelfReflectionPayloadSchema = Joi.object({
  content: Joi.string().required(),
});
