import Joi from "joi";

export const MiniCexPayloadSchema = Joi.object({
  case: Joi.string().required(),
  location: Joi.number().required(),
});

export const GradeItemMiniCexSchema = Joi.object({
  name: Joi.string().required(),
});

export const GradeItemMiniCexScoreSchema = Joi.object({
  scores: Joi.array()
    .items(
      Joi.object({
        score: Joi.number().required(),
        id: Joi.number().required(),
      })
    )
    .min(0),
});
