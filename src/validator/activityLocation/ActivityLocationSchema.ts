import Joi from "joi";

export const ActivityLocationPayloadSchema = Joi.object({
  name: Joi.string().required(),
});
