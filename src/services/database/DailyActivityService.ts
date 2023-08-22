import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../../database";
import { DailyActivity } from "../../models/DailyActivity";
import { createErrorObject } from "../../utils";
import {
  IPutDailyActivityActivity,
  IPutDailyActivityVerificationStatus,
} from "../../utils/interfaces/DailyActivity";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";

export class DailyActivityService {
  private dailyActivityModel: DailyActivity;
  private studentService: StudentService;

  constructor() {
    this.dailyActivityModel = new DailyActivity();
    this.studentService = new StudentService();
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

  async verifyDailyActivity(
    id: string,
    tokenPayload: ITokenPayload,
    payload: IPutDailyActivityVerificationStatus
  ) {
    const dailyActivity = await this.dailyActivityModel.getDailyActivityById(
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
    ]);
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

  async getDailyActivitiesByStudentIdAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const dailyActivities =
      await this.dailyActivityModel.getDailyActivitiesByStudentIdAndUnitId(
        tokenPayload.studentId,
        activeUnit?.activeUnit.activeUnit?.id
      );

    return dailyActivities;
  }

  async editDailyActivityActivity(
    tokenPayload: ITokenPayload,
    id: string,
    payload: IPutDailyActivityActivity
  ) {
    const dailyActivityActivity =
      await this.dailyActivityModel.getDailyActivityActivityById(id);

    if (!dailyActivityActivity) {
      return createErrorObject(404, "activity's not found");
    }

    if (
      dailyActivityActivity?.DailyActivity?.studentId !== tokenPayload.studentId
    ) {
      return createErrorObject(400, "activity's not for you");
    }

    return this.dailyActivityModel.editDailyActivityActivityById(id, payload);
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

    if (
      dailyActivity.studentId !== tokenPayload.studentId &&
      dailyActivity.Student?.examinerSupervisorId !==
        tokenPayload.supervisorId &&
      dailyActivity.Student?.supervisingSupervisorId !==
        tokenPayload.supervisorId &&
      dailyActivity.Student?.academicSupervisorId !== tokenPayload.supervisorId
    ) {
      return createErrorObject(400, "daily activity's not for you");
    }

    return dailyActivity;
  }
}
