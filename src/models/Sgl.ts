import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import {
  IPostSGL,
  IPutSglTopicVerificationStatus,
} from "../utils/interfaces/Sgl";

export class Sgl {
  async verifySglById(id: string, payload: IPutSglTopicVerificationStatus) {
    try {
      return db.sGL.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
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

  async getSglById(id: string) {
    return db.sGL.findUnique({
      where: {
        id,
      },
      include: {
        topics: true,
      },
    });
  }

  async verifySglTopicById(
    topicId: string,
    payload: IPutSglTopicVerificationStatus
  ) {
    try {
      return db.sglTopic.update({
        where: {
          id: topicId,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
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

  async getSglTopicById(topicId: string) {
    return db.sglTopic.findUnique({
      where: {
        id: topicId,
      },
    });
  }

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
              topic: {
                connect: payload.topicId.map((t) => {
                  return { id: t };
                }),
              },
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
