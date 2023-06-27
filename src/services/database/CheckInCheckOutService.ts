import { CheckInCheckOut } from "../../models/CheckInCheckOut";
import { createErrorObject } from "../../utils";

export class CheckInCheckOutService {
  private checkInCheckOutModel: CheckInCheckOut;

  constructor() {
    this.checkInCheckOutModel = new CheckInCheckOut();
  }

  async getAllCheckInStudents() {
    return this.checkInCheckOutModel.getStudentCheckIn();
  }

  async getCheckInCheckOutByUnitIdAndStudentId(studentId: string, id?: string) {
    if (!id) {
      return createErrorObject(400, "no active unit");
    }

    const checkInCheckOutUnit =
      this.checkInCheckOutModel.getCheckInCheckOutByUnitIdAndStudentId(
        studentId,
        id
      );

    if (!checkInCheckOutUnit) {
      return createErrorObject(404, "studentId and activeUnit not suitable");
    }

    return checkInCheckOutUnit;
  }
}
