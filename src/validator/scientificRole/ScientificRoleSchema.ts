import Joi from "joi";

export const ScientificRolePayloadSchema = Joi.object({
  name: Joi.string().required(),
});
