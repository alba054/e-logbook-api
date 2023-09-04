import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import { IPostScientificSessionPayload } from "../utils/interfaces/ScientificSession";
import { History } from "./History";

export class ScientificSession {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async insertSupervisorFeedback(id: string, feedback: string) {
    try {
      return db.scientificSession.update({
        where: {
          id,
        },
        data: {
          supervisorFeedback: feedback,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to insert feedback of scientific session"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertStudentFeedback(id: string, feedback: string) {
    try {
      return db.scientificSession.update({
        where: {
          id,
        },
        data: {
          studentFeedback: feedback,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to insert feedback of scientific session"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getScientificSessionsByStudentIdAndUnitId(
    studentId: string,
    unitId?: string
  ) {
    return db.scientificSession.findMany({
      where: {
        studentId,
        unitId,
      },
      include: {
        supervisor: true,
      },
    });
  }

  async getScientificSessionsBySupervisorId(supervisorId?: string) {
    return db.scientificSession.findMany({
      where: {
        supervisorId,
      },
      include: {
        Student: true,
      },
    });
  }

  async getScientificSessionsByStatusAndSupervisorId(
    status: any,
    page: any,
    take: any,
    name: any,
    nim: any,
    supervisorId?: string
  ) {
    return db.scientificSession.findMany({
      where: {
        verificationStatus: status,
        Student: {
          fullName: { contains: name },
          studentId: nim,
        },
        supervisorId,
      },
      include: {
        Student: true,
      },
      take: take,
      skip: take * (page - 1),
    });
  }

  async getScientificSessionById(id: string) {
    return db.scientificSession.findUnique({
      where: {
        id,
      },
      include: {
        Student: true,
        supervisor: true,
        Unit: true,
        scientificRole: true,
        sessionType: true,
      },
    });
  }

  // todo: role and session type is hardcoded
  async insertScientificSession(
    payload: IPostScientificSessionPayload,
    id: string,
    studentId?: string,
    unitId?: string
  ) {
    try {
      return (
        await db.$transaction([
          db.scientificSession.create({
            data: {
              id,
              studentId: studentId ?? "",
              unitId: unitId ?? "",
              reference: payload.reference,
              title: payload.title,
              topic: payload.topic,
              attachment: payload.attachment,
              note: payload.notes,
              supervisorId: payload.supervisorId,
              sessionTypeId: payload.sessionType,
              scientificRoleId: payload.role,
            },
          }),
          this.historyModel.insertHistoryAsync(
            "SCIENTIFIC_SESSION",
            getUnixTimestamp(),
            studentId,
            payload.supervisorId,
            id,
            unitId
          ),
        ])
      )[0];
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to insert new scientific session"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }
}
