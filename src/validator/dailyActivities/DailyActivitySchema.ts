import Joi from "joi";

export const DailyActivityActivityPayloadSchema = Joi.object({
  activityStatus: Joi.string()
    .valid("SICK", "ATTEND", "NOT_ATTEND", "HOLIDAY")
    .required(),
  detail: Joi.string().optional(),
  supervisorId: Joi.string().optional(),
  locationId: Joi.number().optional(),
  activityNameId: Joi.number().optional(),
});

export const DailyActivityVerificationStatusSchema = Joi.object({
  verified: Joi.boolean().required(),
});
