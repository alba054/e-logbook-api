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
            increment: count,
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
            studentId,
          },
          unitId,
        },
        data: {
          checkInStatus: verified ? "VERIFIED" : "UNVERIFIED",
          userId,
        },
      });

      if (verified) {
        const checkIn = await db.checkInCheckOut.findFirst({
          where: {
            student: {
              studentId,
            },
            unitId,
          },
        });
        try {
          await this.historyModel.insertHistory(
            "CHECK_IN",
            getUnixTimestamp(),
            studentId,
            undefined,
            checkIn?.id
          );
        } catch (error) {}
      }

      return result;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update in process checkin");
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
        userId
      );
      if (lastCheckin === null) {
        return createErrorObject(404, "cannot find last check-out");
      }

      return db.checkInCheckOut.updateMany({
        where: {
          id: lastCheckin.id,
        },
        data: {
          checkOutStatus: verified ? "VERIFIED" : "UNVERIFIED",
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update in process checkout");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getStudentCheckIn() {
    return db.checkInCheckOut.findMany({
      where: {
        checkIn: true,
        checkInStatus: "INPROCESS",
      },
      include: {
        student: true,
        unit: true,
      },
    });
  }

  async getStudentCheckOut(userId: string) {
    return db.checkInCheckOut.findMany({
      where: {
        checkOut: true,
        checkOutStatus: "INPROCESS",
        userId,
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
        "VERIFIED"
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
    userId: string | undefined = undefined
  ) {
    return db.checkInCheckOut.findFirst({
      where: {
        unitId,
        studentId,
        userId,
        checkInStatus,
      },
      orderBy: {
        checkInTime: "desc",
      },
    });
  }
}
