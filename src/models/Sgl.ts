import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostSGL } from "../utils/interfaces/Sgl";

export class Sgl {
  async getSglsBySupervisorIdAndStudentId(
    supervisorId: string | undefined,
    studentId: string
  ) {
    return db.sGL.findMany({
      where: {
        Student: {
          studentId,
        },
        topics: {
          some: {
            supervisorId,
          },
        },
      },
      include: {
        topics: {
          where: {
            supervisorId,
          },
          include: {
            topic: true,
          },
        },
        Student: true,
      },
    });
  }

  async getSglsBySupervisorId(supervisorId: string | undefined) {
    return db.sGL.findMany({
      where: {
        topics: {
          some: {
            supervisorId,
          },
        },
      },
      include: {
        topics: {
          where: {
            supervisorId,
          },
        },
        Student: true,
      },
    });
  }

  async insertSgl(
    id: string,
    topicId: string,
    payload: IPostSGL,
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    try {
      return db.sGL.create({
        data: {
          id,
          studentId,
          unitId,
          topics: {
            create: {
              id: topicId,
              endTime: payload.endTime,
              startTime: payload.startTime,
              notes: payload.notes,
              supervisorId: payload.supervisorId,
              topicId: payload.topicId,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert sgl");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
