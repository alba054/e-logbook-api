import Joi from "joi";

export const WeekPayloadSchema = Joi.object({
  weekNum: Joi.number().required(),
  unitId: Joi.string().required(),
  startDate: Joi.number().required(),
  endDate: Joi.number().required(),
});
