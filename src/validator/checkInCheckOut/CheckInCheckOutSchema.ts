import Joi from "joi";

export const CheckInVerificationSchema = Joi.object({
  verified: Joi.boolean().required(),
});
