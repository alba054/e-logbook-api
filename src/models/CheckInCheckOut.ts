import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import { History } from "./History";

export class CheckInCheckOut {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
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
          unitId,
          studentId,
          checkInStatus: "INPROCESS",
        },
        data: {
          checkInStatus: verified ? "VERIFIED" : "UNVERIFIED",
          userId,
        },
      })

      if (verified) {
        try {
          await this.historyModel.insertHistory(
            "CHECK_IN",
            getUnixTimestamp(),
            studentId,
            undefined,
            undefined
          );
        } catch (error) {}
      }

      return result
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
