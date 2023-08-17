import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import {
  IPostCST,
  IPutCstTopicVerificationStatus,
} from "../utils/interfaces/Cst";

export class Cst {
  async getCstsByStudentId(studentId: string) {
    return db.sGL.findMany({
      where: {
        Student: {
          studentId,
        },
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        Student: true,
      },
    });
  }

  async getCsts() {
    return db.cST.findMany({
      include: {
        topics: true,
        Student: true,
      },
    });
  }

  async verifyCstById(id: string, payload: IPutCstTopicVerificationStatus) {
    try {
      return db.cST.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert Cst");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getCstById(id: string) {
    return db.cST.findUnique({
      where: {
        id,
      },
      include: {
        topics: true,
      },
    });
  }

  async verifyCstTopicById(
    topicId: string,
    payload: IPutCstTopicVerificationStatus
  ) {
    try {
      return db.cstTopic.update({
        where: {
          id: topicId,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert Cst");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getCstTopicById(topicId: string) {
    return db.cstTopic.findUnique({
      where: {
        id: topicId,
      },
    });
  }

  async getCstsBySupervisorIdAndStudentId(
    supervisorId: string | undefined,
    studentId: string
  ) {
    return db.cST.findMany({
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

  async getCstsBySupervisorId(supervisorId: string | undefined) {
    return db.cST.findMany({
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

  async insertCst(
    id: string,
    topicId: string,
    payload: IPostCST,
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    try {
      return db.cST.create({
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
        return createErrorObject(400, "failed to insert Cst");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
