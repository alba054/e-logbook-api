import Joi from "joi";

export const ManagementRolePayloadSchema = Joi.object({
  roleName: Joi.string().required(),
});
