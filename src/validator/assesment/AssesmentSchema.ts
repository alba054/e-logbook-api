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
        score: Joi.number().required().min(0).max(100),
        id: Joi.number().required(),
      })
    )
    .min(0),
});

export const GradeItemMiniCexScoreV2Schema = Joi.object({
  scores: Joi.array()
    .items(
      Joi.object({
        score: Joi.number().required().min(0).max(100),
        name: Joi.string().required(),
      })
    )
    .min(0),
});

export const GradeItemPersonalBehaviourVerificationStatusSchema = Joi.object({
  id: Joi.number().required(),
  verified: Joi.boolean().required(),
});

export const AssesmentScoreSchema = Joi.object({
  type: Joi.string().valid("OSCE", "CBT").required(),
  score: Joi.number().required().min(0).max(100),
});
