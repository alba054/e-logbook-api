import Joi from "joi";

export const ActivityNamePayloadSchema = Joi.object({
  name: Joi.string().required(),
});
