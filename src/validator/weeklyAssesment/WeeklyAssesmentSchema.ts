import Joi from "joi";

export const WeeklyAssesmentScorePayloadSchema = Joi.object({
  score: Joi.number().min(0).max(100).required(),
});
