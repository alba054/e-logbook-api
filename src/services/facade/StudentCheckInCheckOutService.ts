import { CheckInCheckOut } from "../../models/CheckInCheckOut";
import { Student } from "../../models/Student";
import { v4 as uuidv4 } from "uuid";
import { StudentDailyActivityService } from "./StudentDailyActivityService";
import { createErrorObject, getUnixTimestamp } from "../../utils";
import { studentPersonalBehaviourService } from "./StudentPersonalBehaviourService";
import { StudentOsceAndCBTService } from "./StudentOsceAndCBTService";
import { History } from "../../models/History";
import db from "../../database";
import { DailyActivityService } from "../database/DailyActivityService";

export class StudentCheckInCheckOutService {
  private studentModel: Student;
  private checkInCheckOutModel: CheckInCheckOut;
  private dailyActivityService: DailyActivityService;
  private studentDailyActivityService: StudentDailyActivityService;
  private studentPersonalBehaviourService: studentPersonalBehaviourService;
  studentOsceAndCBTService: StudentOsceAndCBTService;
  private historyModel: History;

  constructor() {
    this.studentModel = new Student();
    this.historyModel = new History();
    this.dailyActivityService = new DailyActivityService();
    this.checkInCheckOutModel = new CheckInCheckOut();
    this.studentDailyActivityService = new StudentDailyActivityService();
    this.studentPersonalBehaviourService =
      new studentPersonalBehaviourService();
    this.studentOsceAndCBTService = new StudentOsceAndCBTService();
  }

  async studentCheckInActiveUnit(studentId: string) {
    const studentActiveUnit = await this.studentModel.getActiveUnit(studentId);

    return await this.checkInCheckOutModel.insertNewCheckInCheckOutUnit(
      uuidv4(),
      studentId,
      studentActiveUnit?.activeUnit?.id
    );
  }

  async studentCheckOutActiveUnit(studentId: string) {
    const studentActiveUnit = await this.studentModel.getActiveUnit(studentId);
    const id = studentActiveUnit?.activeUnit?.id;

    if (!id) {
      return createErrorObject(400, "cannot checkout empty unit");
    }

    const dailyActivities =
      await this.dailyActivityService.getActivitiesByWeekIdStudentIdUnitId(
        id,
        studentId
      );

    var isVerify: boolean = true;
    for (let index = 0; index < dailyActivities.length; index++) {
      const temp = dailyActivities[index].Activity;
      const notVerify =
        temp?.activityStatus == "ATTEND" &&
        temp?.verificationStatus == "INPROCESS";
      if (notVerify) {
        isVerify = false;
        return createErrorObject(400, "all daily activity must be verified");
      }
    }

    return await this.checkInCheckOutModel.updateCheckOutCheckInCheckOutUnit(
      studentId,
      id
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

    const checkIn = await this.checkInCheckOutModel.verifyInProcessCheckIn(
      payload.verified,
      userId,
      studentId,
      studentActiveUnit?.activeUnit?.id
    );

    // !unused doesn't generate daily activity anymore
    this.studentDailyActivityService.generateDailyActivity(
      student?.id,
      studentActiveUnit?.activeUnit?.id
    );

    this.studentPersonalBehaviourService.generatePersonalBehaviourAssesment(
      student?.id,
      studentActiveUnit?.activeUnit?.id
    );

    this.studentOsceAndCBTService.generateOsceAndCBTAssesment(
      studentId,
      student?.id,
      studentActiveUnit?.activeUnit?.id
    );

    return checkIn;
  }

  async verifyStudentCheckOut(
    studentId: string,
    userId: string,
    payload: { verified: boolean }
  ) {
    const studentActiveUnit = await this.studentModel.getActiveUnitByStudentId(
      studentId
    );
    const student = await this.studentModel.getStudentByStudentId(studentId);

    const checkIn = await this.checkInCheckOutModel.verifyInProcessCheckOut(
      payload.verified,
      userId,
      studentActiveUnit?.id,
      studentActiveUnit?.activeUnit?.id
    );

    if (checkIn) {
      await this.checkInCheckOutModel.updateCheckInCounterByUnitIdAndStudentId(
        studentId,
        studentActiveUnit?.activeUnit?.id ?? "",
        1
      );

      await db.student.update({
        where: {
          id: student?.id,
        },
        data: {
          supervisingSupervisorId: null,
          examinerSupervisorId: null,
          academicSupervisorId: null,
        },
      });
    }

    return checkIn;
  }
}
