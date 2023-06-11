import Joi from "joi";

export const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string()
    .optional()
    .pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/),
  password: Joi.string().required(),
});
