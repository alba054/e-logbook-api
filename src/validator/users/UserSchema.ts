import Joi from "joi";

export const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});
