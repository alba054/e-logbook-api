import Joi from "joi";

export const ExaminationTypePayloadSchema = Joi.object({
  unitId: Joi.string().required(),
  typeName: Joi.string().required(),
});
