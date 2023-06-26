import { CheckInCheckOut } from "../../models/CheckInCheckOut";
import { Student } from "../../models/Student";
import { IActiveUnitDTO } from "../../utils/dto/ActiveUnitDTO";
import { IPutStudentActiveUnit } from "../../utils/interfaces/Student";

export class StudentService {
  private studentModel: Student;
  private checkInCheckoutModel: CheckInCheckOut;

  constructor() {
    this.studentModel = new Student();
    this.checkInCheckoutModel = new CheckInCheckOut();
  }

  async getActiveUnit(studentId: string) {
    const activeUnit = await this.studentModel.getActiveUnit(studentId);

    if (activeUnit && activeUnit.activeUnit) {
      const checkInCheckOutUnit =
        await this.checkInCheckoutModel.getCheckInCheckOutByUnitIdAndStudentId(
          studentId,
          activeUnit.activeUnit.id
        );

      return {
        checkInStatus: checkInCheckOutUnit?.checkInStatus,
        checkOutStatus: checkInCheckOutUnit?.checkOutStatus,
        unitId: activeUnit.activeUnit.id,
        unitName: activeUnit.activeUnit.name,
      } as IActiveUnitDTO;
    }

    return null;
  }

  async setActiveUnit(studentId: string, payload: IPutStudentActiveUnit) {
    return this.studentModel.updateStudentActiveUnitByStudentId(
      studentId,
      payload
    );
  }
}
