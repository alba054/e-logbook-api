import { Student } from "../../models/Student";
import { IPutStudentActiveUnit } from "../../utils/interfaces/Student";

export class StudentService {
  private studentModel: Student;

  constructor() {
    this.studentModel = new Student();
  }

  async getActiveUnit(studentId: string) {
    return this.studentModel.getActiveUnit(studentId);
  }

  async setActiveUnit(studentId: string, payload: IPutStudentActiveUnit) {
    return this.studentModel.updateStudentActiveUnitByStudentId(
      studentId,
      payload
    );
  }
}
