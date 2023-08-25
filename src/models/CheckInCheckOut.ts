import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";

export class CheckInCheckOut {
  constructor() {}

  async verifyInProcessCheckIn(
    verified: boolean,
    userId: string,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return db.checkInCheckOut.updateMany({
        where: {
          unitId,
          studentId,
          checkInStatus: "INPROCESS",
        },
        data: {
          checkInStatus: verified ? "VERIFIED" : "UNVERIFIED",
          userId,
        },
      });
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
      return db.checkInCheckOut.updateMany({
        where: {
          unitId,
          studentId,
          userId,
          checkOutStatus: "INPROCESS",
        },
        data: {
          checkOutStatus: verified ? "VERIFIED" : "UNVERIFIED",
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update in process checkin");
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
        userId
      },
      include: {
        student: true,
        unit: true,
      }
    })
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
  async updateCheckOutCheckInCheckOutUnit(
    studentId: string,
    unitId: string
  ) {
    try {
      return db.checkInCheckOut.updateMany({
        where: {
          unitId,
          studentId,
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
}
