import Joi from "joi";

export const MiniCexPayloadSchema = Joi.object({
  case: Joi.string().required(),
  location: Joi.number().required(),
});

export const GradeItemMiniCexSchema = Joi.object({
  name: Joi.string().required(),
});
