import Joi from "joi";

export const ManagementTypePayloadSchema = Joi.object({
  unitId: Joi.string().required(),
  typeName: Joi.string().required(),
});
