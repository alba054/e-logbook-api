import { CheckInCheckOut } from "../../models/CheckInCheckOut";
import { Student } from "../../models/Student";
import { v4 as uuidv4 } from "uuid";
import { StudentDailyActivityService } from "./StudentDailyActivityService";
import { studentPersonalBehaviourService } from "./StudentPersonalBehaviourService";

export class StudentCheckInCheckOutService {
  private studentModel: Student;
  private checkInCheckOutModel: CheckInCheckOut;
  private studentDailyActivityService: StudentDailyActivityService;
  private studentPersonalBehaviourService: studentPersonalBehaviourService;

  constructor() {
    this.studentModel = new Student();
    this.checkInCheckOutModel = new CheckInCheckOut();
    this.studentDailyActivityService = new StudentDailyActivityService();
    this.studentPersonalBehaviourService =
      new studentPersonalBehaviourService();
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
    const student = await this.studentModel.getStudentByStudentId(studentId);

    const checkIn = this.checkInCheckOutModel.verifyInProcessCheckIn(
      payload.verified,
      userId,
      studentActiveUnit?.id,
      studentActiveUnit?.activeUnit?.id
    );

    this.studentDailyActivityService.generateDailyActivity(
      student?.id,
      studentActiveUnit?.activeUnit?.id
    );

    this.studentPersonalBehaviourService.generatePersonalBehaviourAssesment(
      student?.id,
      studentActiveUnit?.activeUnit?.id
    );

    return checkIn;
  }
}
