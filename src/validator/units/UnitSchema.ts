import Joi from "joi";

export const UnitPayloadSchema = Joi.object({
  name: Joi.string().required(),
});
