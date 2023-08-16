import Joi from "joi";

export const TopicPayloadSchema = Joi.object({
  name: Joi.string().required(),
});
