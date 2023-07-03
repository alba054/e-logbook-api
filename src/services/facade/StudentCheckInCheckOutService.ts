import { CheckInCheckOut } from "../../models/CheckInCheckOut";
import { Student } from "../../models/Student";
import { v4 as uuidv4 } from "uuid";

export class StudentCheckInCheckOutService {
  private studentModel: Student;
  private checkInCheckOutModel: CheckInCheckOut;
  constructor() {
    this.studentModel = new Student();
    this.checkInCheckOutModel = new CheckInCheckOut();
  }

  async studentCheckInActiveUnit(studentId: string) {
    const studentActiveUnit = await this.studentModel.getActiveUnit(studentId);

    return await this.checkInCheckOutModel.insertNewCheckInCheckOutUnit(
      uuidv4(),
      studentId,
      studentActiveUnit?.activeUnit?.id
    );
  }

  async verifyStudentCheckIn(
    studentId: string,
    userId: string,
    payload: { verified: boolean }
  ) {
    const studentActiveUnit = await this.studentModel.getActiveUnitByStudentId(
      studentId
    );

    return this.checkInCheckOutModel.verifyInProcessCheckIn(
      payload.verified,
      userId,
      studentActiveUnit?.id,
      studentActiveUnit?.activeUnit?.id
    );
  }
}
