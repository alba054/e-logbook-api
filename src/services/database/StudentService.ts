import { CheckInCheckOut } from "../../models/CheckInCheckOut";
import { Student } from "../../models/Student";
import { createErrorObject } from "../../utils";
import { IActiveUnitDTO } from "../../utils/dto/ActiveUnitDTO";
import {
  IPutStudentActiveUnit,
  IPutStudentData,
} from "../../utils/interfaces/Student";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";

export class StudentService {
  private studentModel: Student;
  private checkInCheckoutModel: CheckInCheckOut;

  constructor() {
    this.studentModel = new Student();
    this.checkInCheckoutModel = new CheckInCheckOut();
  }

  async getStudentBySupervisorId(tokenPayload: ITokenPayload, ceu: any) {
    if (ceu) {
      return this.studentModel.getAllStudents();
    }

    return this.studentModel.getStudentBySupervisorId(
      tokenPayload.supervisorId
    );
  }

  async getStudentByStudentId(studentId: string) {
    const student = await this.studentModel.getStudentByStudentId(studentId);

    if (!student) {
      return createErrorObject(404, "student's not found");
    }

    return student;
  }

  async getStudentById(studentId?: string) {
    return this.studentModel.getStudentById(studentId);
  }

  async updateStudentData(
    tokenPayload: ITokenPayload,
    payload: IPutStudentData
  ) {
    return this.studentModel.updateStudentProfile(
      tokenPayload.studentId,
      payload
    );
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
        activeUnit,
        checkInCheckOutUnit,
      };
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
