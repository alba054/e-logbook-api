import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPutDailyActivityActivity } from "../utils/interfaces/DailyActivity";

export class DailyActivity {
  async getActivitiesByWeekIdAndStudentIdAndUnitId(
    weekId: string,
    studentId: string | undefined,
    unitId: string | null | undefined
  ) {
    return db.dailyActivity.findMany({
      where: {
        studentId,
        unitId,
        day: {
          weekId,
        },
      },
      include: {
        Activity: {
          include: {
            ActivityName: true,
            location: true,
            supervisor: true,
          },
        },

        day: true,
      },
    });
  }

  async getActivitiesBySupervisor(supervisorId: string | undefined) {
    return db.dailyActivity.findMany({
      where: {
        Activity: {
          supervisorId,
        },
      },
      include: {
        Unit: true,
        day: {
          include: {
            week: true,
          },
        },
        Student: true,
        Activity: {
          include: {
            location: true,
            ActivityName: true,
          },
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    });
  }

  async postDailyActivity(
    id: string,
    dayId: string,
    studentId: string,
    unitId: string,
    activityId: string,
    payload: IPutDailyActivityActivity
  ) {
    return db.dailyActivity.create({
      data: {
        id,
        dayId,
        studentId,
        unitId,
        Activity: {
          create: {
            id: activityId,
            activityLocationId: payload.locationId,
            activityNameId: payload.activityNameId,
            activityStatus: payload.activityStatus,
            detail: payload.detail,
            supervisorId: payload.supervisorId,
          },
        },
      },
    });
  }

  async getDailyActivityActivityByDayIdAndStudentIdAndUnitId(
    dayId: string,
    studentId: string,
    unitId: string
  ) {
    return db.dailyActivity.findFirst({
      where: {
        dayId,
        unitId,
        studentId,
      },
      include: {
        Unit: true,
        Student: true,
        day: {
          include: {
            week: true,
          },
        },
        Activity: {
          include: {
            location: true,
            ActivityName: true,
          },
        },
      },
    });
  }

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
    return db.dailyActivity.findMany({
      where: {
        studentId,
        unitId,
      },
      include: {
        Unit: true,
        Student: true,
        day: {
          include: {
            week: true,
          },
        },
        Activity: {
          include: {
            location: true,
            ActivityName: true,
          },
        },
      },
      orderBy: {
        day: {  
          week: {
            weekNum: "asc",
          },
        },
      },
    });
  }

  async editDailyActivityActivityById(
    id: string,
    payload: IPutDailyActivityActivity
  ) {
    try {
      return db.dailyActivity.update({
        where: {
          id,
        },
        data: {
          Activity: {
            update: {
              activityLocationId: payload.locationId,
              activityNameId: payload.activityNameId,
              activityStatus: payload.activityStatus,
              detail: payload.detail,
              supervisorId: payload.supervisorId,
            },
          },
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
      include: {
        Activity: {
          include: {
            location: true,
            ActivityName: true,
          }
        },
        Student: true,
        
        Unit: true,
        day: { include: { week: true} },
      },
    });
  }
}