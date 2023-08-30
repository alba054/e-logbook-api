import { Assesment } from "../../models/Assesment";
import { v4 as uuidv4 } from "uuid";
import { PersonalBehaviourGradeItemService } from "../database/PersonalBehaviourGradeItemService";
import db from "../../database";
import { History } from "../../models/History";
import { getUnixTimestamp } from "../../utils";

export class studentPersonalBehaviourService {
  private assesmentModel: Assesment;
  private personalBehaviourGradeItemService: PersonalBehaviourGradeItemService;
  private historyModel: History;

  constructor() {
    this.assesmentModel = new Assesment();
    this.personalBehaviourGradeItemService =
      new PersonalBehaviourGradeItemService();
    this.historyModel = new History();
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
      const assesmentId = uuidv4();
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
            id: assesmentId,
            type: "PERSONAL_BEHAVIOUR",
            personalBehaviourId,
            studentId: studentId,
            unitId: unitId,
          },
        }),
        this.historyModel.insertHistoryAsync(
          "PERSONAL_BEHAVIOUR",
          getUnixTimestamp(),
          studentId,
          undefined,
          assesmentId
        ),
      ];
    }

    return db.$transaction([...personalBehaviourQuery]);
  }
}
