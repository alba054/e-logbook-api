import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPutDailyActivityActivity } from "../utils/interfaces/DailyActivity";

export class DailyActivity {
  async getActivitiesBySupervisorAndStudentId(
    supervisorId: string | undefined,
    studentId: string
  ) {
    return db.dailyActivity.findMany({
      where: {
        Student: {
          OR: [
            {
              academicSupervisorId: supervisorId,
            },
            {
              supervisingSupervisorId: supervisorId,
            },
            {
              examinerSupervisorId: supervisorId,
            },
          ],
          studentId,
        },
      },
      // include: {
      //   Unit: true,
      //   activities: {
      //     include: {
      //       ActivityName: true,
      //       location: true,
      //     },
      //   },
      // },
      // orderBy: {
      //   weekNum: "asc",
      // },
    });
  }

  async getDailyActivitiesByStudentIdAndUnitId(
    studentId: string,
    unitId: string
  ) {
    return db.dailyActivity.findUnique({
      where: {
        // studentId_unitId: {
        //   studentId: studentId,
        //   unitId: unitId,
        // },
      },
      include: {
        Unit: true,
        Student: true,
        // weeks: true,
      },
    });
  }

  async editDailyActivityActivityById(
    id: string,
    payload: IPutDailyActivityActivity
  ) {
    try {
      return db.activity.update({
        where: {
          id,
        },
        data: {
          activityNameId: payload.activityNameId,
          activityStatus: payload.activityStatus,
          activityLocationId: payload.locationId,
          detail: payload.detail,
          supervisorId: payload.supervisorId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to update daily activity activity"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getDailyActivityActivityById(id: string) {
    return db.activity.findUnique({
      where: {
        id,
      },
      // include: {
      //   DailyActivity: true,
      // },
    });
  }

  async getDailyActivityById(id: string) {
    return db.dailyActivity.findUnique({
      where: {
        id,
      },
      // include: {
      //   activities: {
      //     include: {
      //       ActivityName: true,
      //       location: true,
      //     },
      //   },
      //   Student: true,
      // },
    });
  }
}
