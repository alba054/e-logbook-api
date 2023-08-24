import Joi from "joi";

export const MiniCexPayloadSchema = Joi.object({
  case: Joi.string().required(),
  location: Joi.number().required(),
});
