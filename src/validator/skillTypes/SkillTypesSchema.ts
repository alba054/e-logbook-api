import Joi from "joi";

export const SkillTypesPayloadSchema = Joi.object({
  unitId: Joi.string().required(),
  name: Joi.string().required(),
});
