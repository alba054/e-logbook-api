import Joi from "joi";
export const ClinicalRecordPayloadSchema = Joi.object({
  patientName: Joi.string().required(),
  patientAge: Joi.number().min(1),
  gender: Joi.string().valid("FEMALE", "MALE").required(),
  notes: Joi.string().optional(),
  recordId: Joi.string().required(),
  attachment: Joi.string().optional(),
  studentFeedback: Joi.string().optional(),
  examinations: Joi.array().items(
    Joi.object({
      affectedPartId: Joi.string().required(),
      examinationTypeId: Joi.array().items(Joi.string()).min(1),
    })
  ),
  diagnosiss: Joi.array().items(
    Joi.object({
      affectedPartId: Joi.string().required(),
      diagnosisTypeId: Joi.array().items(Joi.string()).min(1),
    })
  ),
  managements: Joi.array().items(
    Joi.object({
      affectedPartId: Joi.string().required(),
      management: Joi.array()
        .items(
          Joi.object({
            managementTypeId: Joi.string().required(),
            managementRoleId: Joi.string().required(),
          })
        )
        .min(1),
    })
  ),
});
