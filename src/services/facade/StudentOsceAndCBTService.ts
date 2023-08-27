import db from "../../database";
import { v4 as uuidv4 } from "uuid";
import { Assesment } from "../../models/Assesment";

export class StudentOsceAndCBTService {
  private assesmentModel: Assesment;

  constructor() {
    this.assesmentModel = new Assesment();
  }

  async generateOsceAndCBTAssesment(
    studentID: string,
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    const osce =
      await this.assesmentModel.getAssesmentsByStudentIdAndUnitIdAndType(
        studentID,
        unitId,
        "OSCE"
      );

    if (!osce) {
      const osceId = uuidv4();
      const cbtId = uuidv4();

      return db.$transaction([
        db.oSCE.create({
          data: {
            id: osceId,
          },
        }),
        db.cBT.create({
          data: {
            id: cbtId,
          },
        }),
        db.assesment.createMany({
          data: [
            { id: osceId, type: "OSCE", oSCEId: osceId, studentId, unitId },
            { id: cbtId, type: "CBT", cBTId: cbtId, studentId, unitId },
          ],
        }),
      ]);
    }
  }
}
