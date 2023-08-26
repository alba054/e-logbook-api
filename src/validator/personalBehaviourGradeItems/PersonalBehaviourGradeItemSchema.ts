import Joi from "joi";

export const PersonalBehaviourGradeItemPayloadSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string()
    .valid(
      "ALTRUISM",
      "HONOR_INTEGRITY",
      "CARING_COMPASSION",
      "RESPECT",
      "RESPONSIBILITY",
      "ACCOUNTABILITY",
      "EXCELLENCE_SCHOLARSHIP",
      "LEADERSHIP"
    )
    .required(),
});
