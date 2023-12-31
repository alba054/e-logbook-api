import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import { History } from "./History";

export class CheckInCheckOut {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async updateCheckInCounterByUnitIdAndStudentId(
    studentId: string,
    unitId: string,
    count: number
  ) {
    try {
      return db.checkInCheckOut.updateMany({
        where: {
          student: { studentId },
          unitId,
        },
        data: {
          countCheckIn: {
            set: count,
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update in check in counter");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async verifyInProcessCheckIn(
    verified: boolean,
    userId: string,
    studentId?: string,
    unitId?: string
  ) {
    try {
      const result = await db.checkInCheckOut.updateMany({
        where: {
          student: {
            studentId: studentId === null ? undefined : studentId,
          },
          unitId: unitId === null ? undefined : unitId,
        },
        data: {
          checkInStatus: verified ? "VERIFIED" : "UNVERIFIED",
          userId,
        },
      });

      const checkIn = await db.checkInCheckOut.findFirst({
        where: {
          student: {
            studentId: studentId === null ? undefined : studentId,
          },

          unitId: unitId === null ? undefined : unitId,
        },
      });

      await this.historyModel.insertHistory(
        "CHECK_IN",
        getUnixTimestamp(),
        checkIn?.studentId,
        undefined,
        checkIn?.id,
        unitId
      );

      // if (verified) {

      //   // try {

      //   // } catch (error) {}
      // }

      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to verify inprocess checkin");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async verifyInProcessCheckOut(
    verified: boolean,
    userId: string,
    studentId?: string,
    unitId?: string
  ) {
    try {
      const lastCheckin = await this.getLastCheckInByUnitIdAndStudentId(
        studentId ?? "",
        unitId ?? "",
        "VERIFIED",
        true,
        userId
      );
      if (lastCheckin === null) {
        return createErrorObject(404, "cannot find last check-out");
      }
      // (
      // lastCheckin.caseDone &&
      // lastCheckin.cstDone &&
      // lastCheckin.sglDone &&
      // lastCheckin.skillDone &&
      // lastCheckin.dailyActiviyDone &&
      // lastCheckin.clinicalRecordDone &&
      // lastCheckin.selfReflectionDone &&
      // lastCheckin.scientificSessionDone

      // )
      else {
        await this.historyModel.insertHistory(
          "CHECK_OUT",
          getUnixTimestamp(),
          lastCheckin?.studentId,
          undefined,
          lastCheckin?.id,
          unitId
        );

        return db.checkInCheckOut.updateMany({
          where: {
            id: lastCheckin.id,
          },
          data: {
            checkOutStatus: verified ? "VERIFIED" : "UNVERIFIED",
          },
        });
      }
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update in process checkout");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getStudentCheckIn(unitId?: string) {
    return db.checkInCheckOut.findMany({
      where: {
        checkIn: true,
        checkInStatus: "INPROCESS",
        unitId: unitId === null ? undefined : unitId,
      },
      include: {
        student: true,
        unit: true,
      },
    });
  }

  async getStudentCheckOut(userId: string, unitId?: string) {
    return db.checkInCheckOut.findMany({
      where: {
        checkOut: true,
        checkOutStatus: "INPROCESS",
        // userId,
        unitId: unitId === null ? undefined : unitId,
      },
      include: {
        student: true,
        unit: true,
      },
    });
  }

  async insertNewCheckInCheckOutUnit(
    id: string,
    studentId: string,
    unitId?: string
  ) {
    try {
      return db.checkInCheckOut.create({
        data: {
          id,
          checkInTime: Math.floor(new Date().getTime() / 1000),
          checkIn: true,
          studentId,
          unitId: unitId ?? "",
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to insert new checkin checkout unit"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  // What is this name
  // this process student checkout though.
  async updateCheckOutCheckInCheckOutUnit(studentId: string, unitId: string) {
    try {
      const lastCheckin = await this.getLastCheckInByUnitIdAndStudentId(
        studentId,
        unitId,
        "VERIFIED",
        false
      );
      if (lastCheckin === null) {
        return createErrorObject(404, "cannot find last check-out");
      }

      return db.checkInCheckOut.updateMany({
        where: {
          id: lastCheckin.id,
        },
        data: {
          checkOut: true,
          checkOutStatus: "INPROCESS",
          checkOutTime: Math.floor(new Date().getTime() / 1000),
        },
      });

      // if (
      //   lastCheckin.caseDone &&
      //   lastCheckin.cstDone &&
      //   lastCheckin.sglDone &&
      //   lastCheckin.skillDone &&
      //   lastCheckin.clinicalRecordDone &&
      //   lastCheckin.selfReflectionDone &&
      //   lastCheckin.scientificSessionDone
      // ) {
      //   return db.checkInCheckOut.updateMany({
      //     where: {
      //       id: lastCheckin.id,
      //     },
      //     data: {
      //       checkOut: true,
      //       checkOutStatus: "INPROCESS",
      //       checkOutTime: Math.floor(new Date().getTime() / 1000),
      //     },
      //   });
      // }
      // return createErrorObject(
      //   400,
      //   "cannot checkout finish all activities first"
      // );
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update in process checkout");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getCheckInCheckOutByUnitIdAndStudentId(
    studentId: string,
    unitId: string
  ) {
    return db.checkInCheckOut.findFirst({
      where: {
        unitId,
        studentId,
      },
    });
  }

  async getLastCheckInByUnitIdAndStudentId(
    studentId: string,
    unitId: string,
    checkInStatus: "VERIFIED" | "UNVERIFIED" | "INPROCESS",
    isCheckOut: boolean,
    userId: string | undefined = undefined
  ) {
    const whereClause: any = {
      unitId,
      studentId,
      // userId, // userId tidak digunakan dalam kondisi ini
      checkInStatus,
    };
    if (isCheckOut) {
      whereClause.NOT = {
        checkOutTime: null,
      };
    }

    return db.checkInCheckOut.findFirst({
      where: whereClause,
      orderBy: {
        checkInTime: "desc",
      },
    });
  }
}
