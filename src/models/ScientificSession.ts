import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostScientificSessionPayload } from "../utils/interfaces/ScientificSession";

export class ScientificSession {
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
    supervisorId?: string
  ) {
    return db.scientificSession.findMany({
      where: {
        verificationStatus: status,
        supervisorId,
      },
      include: {
        Student: true,
      },
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
      return db.scientificSession.create({
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
          role: "Participant",
          sessionType: "Journal_Reading",
        },
      });
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
