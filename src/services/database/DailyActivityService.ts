import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../../database";
import { DailyActivity } from "../../models/DailyActivity";
import { createErrorObject, getUnixTimestamp } from "../../utils";
import {
  IPutDailyActivityActivity,
  IPutDailyActivityVerificationStatus,
} from "../../utils/interfaces/DailyActivity";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";
import { WeeklyAssesmentService } from "./WeeklyAssesmentService";
import { History } from "../../models/History";

export class DailyActivityService {
  private dailyActivityModel: DailyActivity;
  private studentService: StudentService;
  private weeklyAssesmentService: WeeklyAssesmentService;
  private historyModel: History;

  constructor() {
    this.dailyActivityModel = new DailyActivity();
    this.studentService = new StudentService();
    this.weeklyAssesmentService = new WeeklyAssesmentService();
    this.historyModel = new History();
  }

  async getActivitiesByWeekIdStudentIdUnitId(
    weekId: string,
    studentId: string
  ) {
    const student = await this.studentService.getStudentById(studentId ?? "");

    return this.dailyActivityModel.getActivitiesByWeekIdAndStudentIdAndUnitId(
      weekId,
      student?.id,
      student?.unitId
    );
  }

  async getActivitiesBySupervisorId(
    supervisorId: string | undefined,
    unit?: string | undefined
  ) {
    return this.dailyActivityModel.getActivitiesBySupervisor(
      supervisorId,
      unit
    );
  }

  async getDailyActivitiesByStudentNimAndUnitId(
    studentId: string,
    unitId: string
  ) {
    const dailyActivities =
      await this.dailyActivityModel.getDailyActivitiesByStudentIdAndUnitId(
        studentId,
        unitId
      );

    return dailyActivities;
  }

  async verifyDailyActivitiesV2(
    studentId: string,
    tokenPayload: ITokenPayload,
    payload: IPutDailyActivityVerificationStatus
  ) {
    try {
      return db.$transaction([
        db.dailyActivityV2.updateMany({
          where: {
            Student: {
              OR: [
                {
                  academicSupervisorId: tokenPayload.supervisorId,
                },
                {
                  supervisingSupervisorId: tokenPayload.supervisorId,
                },
                {
                  examinerSupervisorId: tokenPayload.supervisorId,
                },
              ],
              studentId,
            },
          },
          data: {
            verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
          },
        }),
        db.checkInCheckOut.updateMany({
          where: {
            studentId,
          },
          data: {
            dailyActiviyDone: payload.verified,
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to verify all daily activity");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async verifyDailyActivities(
    studentId: string,
    tokenPayload: ITokenPayload,
    payload: IPutDailyActivityVerificationStatus
  ) {
    try {
      return db.$transaction([
        db.dailyActivity.updateMany({
          where: {
            Student: {
              OR: [
                {
                  academicSupervisorId: tokenPayload.supervisorId,
                },
                {
                  supervisingSupervisorId: tokenPayload.supervisorId,
                },
                {
                  examinerSupervisorId: tokenPayload.supervisorId,
                },
              ],
              studentId,
            },
          },
          data: {
            verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
          },
        }),
        db.checkInCheckOut.updateMany({
          where: {
            studentId,
          },
          data: {
            dailyActiviyDone: payload.verified,
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to verify all daily activity");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async verifyDailyActivityV2(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutDailyActivityVerificationStatus
  ) {
    const dailyActivity = await this.dailyActivityModel.getDailyActivityByIdV2(
      id
    );

    if (
      dailyActivity?.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      dailyActivity?.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      dailyActivity?.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(
        400,
        "you are not authorized to verify this self reflection"
      );
    }

    return db.$transaction([
      db.dailyActivityV2.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: dailyActivity?.unitId ?? "",
          studentId: dailyActivity?.studentId ?? "",
        },
        data: {
          dailyActiviyDone: payload.verified,
        },
      }),
    ]);
  }

  async verifyDailyActivity(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutDailyActivityVerificationStatus
  ) {
    const dailyActivity = await this.dailyActivityModel.getDailyActivityById(
      id
    );

    if (dailyActivity?.Activity?.supervisorId !== tokenPayload.supervisorId) {
      return createErrorObject(
        400,
        "you are not authorized to verify this activity"
      );
    }

    const weeklyAssesment =
      await this.weeklyAssesmentService.getWeeklyAssesmentByStudentIdAndUnitIdAndWeekId(
        dailyActivity?.studentId,
        dailyActivity?.unitId,
        dailyActivity?.day?.week?.id
      );

    let weekOp = [];
    if (!weeklyAssesment) {
      weekOp.push(
        db.weekAssesment.create({
          data: {
            id: uuidv4(),
            weekNum: dailyActivity?.day?.week?.weekNum ?? 0,
            studentId: dailyActivity?.studentId,
            unitId: dailyActivity?.unitId,
            score: 0,
            weekId: dailyActivity?.day?.week?.id,
          },
        })
      );
    }

    return db.$transaction([
      db.dailyActivity.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      }),
      db.checkInCheckOut.updateMany({
        where: {
          unitId: dailyActivity?.unitId ?? "",
          studentId: dailyActivity?.studentId ?? "",
        },
        data: {
          dailyActiviyDone: payload.verified,
        },
      }),
      ...weekOp,
      this.historyModel.insertHistoryAsync(
        "DAILY_ACTIVITY",
        getUnixTimestamp(),
        dailyActivity?.studentId ?? "",
        dailyActivity?.Activity?.supervisorId,
        id,
        dailyActivity?.unitId ?? ""
      ),
    ]);
  }

  async getActivitiesByStudentIdV2(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    return this.dailyActivityModel.getActivitiesBySupervisorAndStudentIdV2(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async getActivitiesByStudentId(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    return this.dailyActivityModel.getActivitiesBySupervisorAndStudentId(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async getDailyActivitiesByStudentIdAndUnitId_(
    studentId: string,
    unitId: string
  ) {
    const dailyActivities =
      await this.dailyActivityModel.getDailyActivitiesByStudentIdAndUnitId(
        studentId,
        unitId
      );

    return dailyActivities;
  }

  async getDailyActivitiesByStudentIdAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const dailyActivities =
      await this.dailyActivityModel.getDailyActivitiesByStudentIdAndUnitId(
        tokenPayload.studentId ?? "",
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

    return dailyActivities;
  }

  async editDailyActivityActivity(
    tokenPayload: ITokenPayload,
    dayId: string,
    payload: IPutDailyActivityActivity
  ) {
    const student = await this.studentService.getStudentById(
      tokenPayload.studentId
    );

    const dailyActivityActivity =
      await this.dailyActivityModel.getDailyActivityActivityByDayIdAndStudentIdAndUnitId(
        dayId,
        tokenPayload.studentId ?? "",
        student?.unitId ?? ""
      );

    // if (!dailyActivityActivity) {
    //   return createErrorObject(404, "activity's not found");
    // }

    if (
      dailyActivityActivity &&
      dailyActivityActivity.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "activity's not for you");
    }

    if (dailyActivityActivity) {
      if (dailyActivityActivity.Activity === null) {
        return this.dailyActivityModel.addActivityDailyActivityById(
          dailyActivityActivity.id,
          uuidv4(),
          payload
        );
      } else {
        return this.dailyActivityModel.editDailyActivityActivityById(
          dailyActivityActivity.id,
          payload
        );
      }
    }

    return this.dailyActivityModel.postDailyActivity(
      uuidv4(),
      dayId,
      student?.id ?? "",
      student?.unitId ?? "",
      uuidv4(),
      payload
    );
  }

  async getActivitiesByDailyActivityIdV2(
    tokenPayload: ITokenPayload,
    id: string
  ) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const dailyActivity = await this.dailyActivityModel.getDailyActivityByIdV2(
      id
    );

    if (!dailyActivity) {
      return createErrorObject(404, "daily activity's not found");
    }

    // if (
    //   dailyActivity.studentId !== tokenPayload.studentId &&
    //   dailyActivity.Student?.examinerSupervisorId !==
    //     tokenPayload.supervisorId &&
    //   dailyActivity.Student?.supervisingSupervisorId !==
    //     tokenPayload.supervisorId &&
    //   dailyActivity.Student?.academicSupervisorId !== tokenPayload.supervisorId
    // ) {
    //   return createErrorObject(400, "daily activity's not for you");
    // }

    return dailyActivity;
  }

  async getActivitiesByDailyActivityId(
    tokenPayload: ITokenPayload,
    id: string
  ) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const dailyActivity = await this.dailyActivityModel.getDailyActivityById(
      id
    );

    if (!dailyActivity) {
      return createErrorObject(404, "daily activity's not found");
    }

    // if (
    //   dailyActivity.studentId !== tokenPayload.studentId &&
    //   dailyActivity.Student?.examinerSupervisorId !==
    //     tokenPayload.supervisorId &&
    //   dailyActivity.Student?.supervisingSupervisorId !==
    //     tokenPayload.supervisorId &&
    //   dailyActivity.Student?.academicSupervisorId !== tokenPayload.supervisorId
    // ) {
    //   return createErrorObject(400, "daily activity's not for you");
    // }

    return dailyActivity;
  }
}
