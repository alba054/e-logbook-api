import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import {
  IPostSGL,
  IPostSGLTopic,
  IPutSGL,
  IPutSGLTopic,
  IPutSglTopicVerificationStatus,
} from "../utils/interfaces/Sgl";
import { History } from "./History";

export class Sgl {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async deleteSglById(id: string) {
    return db.sGL.delete({
        where: {
          id
        },
      });
  }

  async editSglTopicById(topicId: string, payload: IPutSGLTopic) {
   return db.$transaction([
     db.topic.deleteMany({
        where: {
          SglTopic: {
            every: {
              id: topicId
            }
          }
        },
      }
    ),
     db.sglTopic.update({
        where: {
          id: topicId,
        },
        data: {
          topic: {
            connect: {
              id: payload.topicId
            },
          }
        }
      }
    ),
   ]);
  }

  async editSglById(id: string, payload: IPutSGL) {
    return db.$transaction([
      db.sGL.update({
        where: {
          id
        },
        data: {
          endTime: payload.endTime,
          startTime: payload.startTime,     
        }
      }),
    ])
  }

  async getSglsWithoutPage() {
    return db.sGL.findMany({
      where: {
        verificationStatus: "INPROCESS",
      },
      include: {
        topics: true,
        Student: true,
        Unit: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getSglsBySupervisorIdWithoutPage(supervisorId: string | undefined) {
    return db.sGL.findMany({
      where: {
        supervisorId: supervisorId === null ? undefined : supervisorId,
      },
      include: {
        topics: true,
        Student: true,
        Unit: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getSglsByStudentIdAndUnitId(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    return db.sGL.findMany({
      where: {
        studentId,
        unitId,
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        Student: true,
        supervisor: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async addTopicToSglById(
    sglId: string,
    topicId: string,
    payload: IPostSGLTopic
  ) {
    try {
      return db.sglTopic.create({
        data: {
          id: topicId,
          notes: payload.notes,
          topic: {
            connect: payload.topicId.map((t) => {
              return { id: t };
            }),
          },
          sGLId: sglId,
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

  async getSglsByStudentId(studentId: string, activeUnit?: string) {
    return db.sGL.findMany({
      where: {
        Student: {
          studentId,
        },
        unitId: activeUnit,
        verificationStatus: "INPROCESS",
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        Student: true,
        supervisor: true,
        Unit: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getSgls(name: any, nim: any, page: any, take: any) {
    return db.sGL.findMany({
      where: {
        Student: {
          fullName: { contains: name },
          studentId: nim,
        },
        verificationStatus: "INPROCESS",
      },
      include: {
        topics: true,
        Student: true,
        Unit: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (page - 1) * take,
      take,
    });
  }

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
      include: {
        SGL: true,
      },
    });
  }

  async getSglsBySupervisorIdAndStudentId(
    supervisorId: string | undefined,
    studentId: string,
    activeUnit?: string
  ) {
    return db.sGL.findMany({
      where: {
        Student: {
          studentId,
        },
        supervisorId: supervisorId === null ? undefined : supervisorId,
        unitId: activeUnit,
        verificationStatus: "INPROCESS",
      },
      include: {
        topics: {
          include: {
            topic: true,
          },
        },
        supervisor: true,
        Student: true,
        Unit: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async getSglsBySupervisorId(
    supervisorId: string | undefined,
    name: any,
    nim: any,
    page: any,
    take: any
  ) {
    return db.sGL.findMany({
      where: {
        supervisorId: supervisorId === null ? undefined : supervisorId,
        Student: {
          fullName: { contains: name },
          studentId: nim,
        },
      },
      include: {
        topics: true,
        Student: true,
        Unit: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      skip: (page - 1) * take,
      take,
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
      return (
        await db.$transaction([
          db.sGL.create({
            data: {
              id,
              studentId,
              unitId,
              supervisorId: payload.supervisorId,
              endTime: payload.endTime,
              startTime: payload.startTime,
              topics: {
                create: {
                  id: topicId,
                  notes: payload.notes,
                  topic: {
                    connect: payload.topicId.map((t) => {
                      return { id: t };
                    }),
                  },
                },
              },
            },
          }),
          this.historyModel.insertHistoryAsync(
            "SGL",
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
        return createErrorObject(400, "failed to insert sgl");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
