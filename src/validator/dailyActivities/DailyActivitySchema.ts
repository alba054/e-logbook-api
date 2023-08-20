import Joi from "joi";

export const DailyActivityActivityPayloadSchema = Joi.object({
  activityStatus: Joi.string().valid("SICK", "ATTEND", "NOT_ATTEND").required(),
  detail: Joi.string().optional(),
  supervisorId: Joi.string().required(),
  locationId: Joi.number().required(),
  activityNameId: Joi.number().required(),
});
