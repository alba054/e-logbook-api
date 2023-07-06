import Joi from "joi";

export const DiagnosisTypePayloadSchema = Joi.object({
  unitId: Joi.string().required(),
  typeName: Joi.string().required(),
});
