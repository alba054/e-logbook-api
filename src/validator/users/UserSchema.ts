import Joi from "joi";

export const UserPayloadSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

export const UserRawPayloadSchema = UserPayloadSchema.append({
  role: Joi.string().valid("SUPERVISOR", "STUDENT", "ADMIN").required(),
});

export const UserProfileSchema = Joi.object({
  username: Joi.string().optional(),
  nim: Joi.string().optional(),
  email: Joi.string().email().optional(),
  pic: Joi.string().optional(),
  fullname: Joi.string().optional(),
  password: Joi.string().optional(),
});

export const UserProfileMasterSchema = Joi.object({
  email: Joi.string().email().optional(),
  fullName: Joi.string().optional(),
  password: Joi.string().optional(),
  address: Joi.string().optional(),
  gender: Joi.string().valid("MALE", "FEMALE").optional(),
  placeOfBirth: Joi.string().optional(),
  dateOfBirth: Joi.number().optional(),
  badges: Joi.array().items(Joi.number()).optional(),
  nip: Joi.string().optional(),
  username: Joi.string().optional(),
  location: Joi.array().items(Joi.number()).optional(),
  units: Joi.array().items(Joi.string()).optional(),
  headDivUnit: Joi.string().optional(),
});
