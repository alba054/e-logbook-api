import Joi from "joi";

export const ScientificAssesmentGradeItemPayloadSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid("SAJIAN", "CARA_PENYAJIAN", "DISKUSI").required(),
});
