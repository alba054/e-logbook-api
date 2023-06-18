import { Student } from "../../models/Student";
import { IPutStudentActiveUnit } from "../../utils/interfaces/Student";

export class StudentService {
  private studentModel: Student;

  constructor() {
    this.studentModel = new Student();
  }

  async setActiveUnit(studentId: string, payload: IPutStudentActiveUnit) {
    return this.studentModel.updateStudentActiveUnitByStudentId(
      studentId,
      payload
    );
  }
}
