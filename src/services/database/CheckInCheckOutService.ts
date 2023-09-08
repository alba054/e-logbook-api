import db from "../../database";
import { CheckInCheckOut } from "../../models/CheckInCheckOut";
import { createErrorObject } from "../../utils";

export class CheckInCheckOutService {
  private checkInCheckOutModel: CheckInCheckOut;

  constructor() {
    this.checkInCheckOutModel = new CheckInCheckOut();
  }

  async getAllCheckInStudents(supervisorId?: string) {
    const supervisor = await db.supervisor.findFirst({
      where: {
        id: supervisorId,
      },
    });

    return this.checkInCheckOutModel.getStudentCheckIn(
      supervisor?.unitId ?? ""
    );
  }

  async getAllCheckOutStudents(userId: string, supervisorId?: string) {
    const supervisor = await db.supervisor.findFirst({
      where: {
        id: supervisorId,
      },
    });

    return this.checkInCheckOutModel.getStudentCheckOut(
      userId,
      supervisor?.unitId ?? ""
    );
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
