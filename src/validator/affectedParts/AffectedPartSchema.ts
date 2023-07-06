import Joi from "joi";

export const AffectedPartPayloadSchema = Joi.object({
  unitId: Joi.string().required(),
  partName: Joi.string().required(),
});
