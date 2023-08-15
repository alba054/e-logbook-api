import Joi from "joi";

export const CaseTypesPayloadSchema = Joi.object({
  unitId: Joi.string().required(),
  name: Joi.string().required(),
});
