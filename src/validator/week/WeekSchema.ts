import Joi from "joi";

export const WeekPayloadSchema = Joi.object({
  weekNum: Joi.number().required(),
  unitId: Joi.string().required(),
  startDate: Joi.number().required(),
  endDate: Joi.number().required(),
});

export const WeekEditPayloadSchema = Joi.object({
  weekNum: Joi.number().optional(),
  startDate: Joi.number().optional(),
  endDate: Joi.number().optional(),
});
