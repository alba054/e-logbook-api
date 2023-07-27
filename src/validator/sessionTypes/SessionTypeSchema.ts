import Joi from "joi";

export const SessionTypePayloadSchema = Joi.object({
  name: Joi.string().required(),
});
