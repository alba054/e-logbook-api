import { Assesment } from "../../models/Assesment";
import { v4 as uuidv4 } from "uuid";
import { PersonalBehaviourGradeItemService } from "../database/PersonalBehaviourGradeItemService";
import db from "../../database";

export class studentPersonalBehaviourService {
  private assesmentModel: Assesment;
  private personalBehaviourGradeItemService: PersonalBehaviourGradeItemService;

  constructor() {
    this.assesmentModel = new Assesment();
    this.personalBehaviourGradeItemService =
      new PersonalBehaviourGradeItemService();
  }

  async generatePersonalBehaviourAssesment(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    const personalBehaviour =
      await this.assesmentModel.getPersonalBehaviourByStudentIdAndUnitId(
        studentId,
        unitId
      );

    const personalBehaviourId = uuidv4();
    let personalBehaviourQuery: any[] = [];

    const personalBehaviourGradeItems =
      await this.personalBehaviourGradeItemService.getPersonalBehaviourGradeItemByUnitId();
    if (!personalBehaviour.length) {
      personalBehaviourQuery = [
        db.personalBehaviour.create({
          data: {
            id: personalBehaviourId,
            PersonalBehaviourGrade: {
              create: personalBehaviourGradeItems.map((s) => {
                return {
                  personalBehaviourGradeItemId: s.id,
                };
              }),
            },
          },
        }),
        db.assesment.create({
          data: {
            id: uuidv4(),
            type: "PERSONAL_BEHAVIOUR",
            personalBehaviourId,
            studentId: studentId,
            unitId: unitId,
          },
        }),
      ];
    }

    return db.$transaction([...personalBehaviourQuery]);
  }
}
