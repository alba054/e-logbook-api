import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import {
  IPostCST,
  IPostCSTTopic,
  IPutCstTopicVerificationStatus,
} from "../utils/interfaces/Cst";
import { History } from "./History";

export class Cst {
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async getCstByStudentIdAndUnitId(
    studentId: string | undefined,
    unitId: string | undefined
  ) {
    return db.cST.findMany({
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
    });
  }

  async addTopicToCstById(
    cstId: string,
    topicId: string,
    payload: IPostCSTTopic
  ) {
    try {
      return db.cstTopic.create({
        data: {
          id: topicId,
          notes: payload.notes,
          topic: {
            connect: payload.topicId.map((t) => {
              return { id: t };
            }),
          },
          CST: {
            connect: {
              id: cstId,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert cst");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getCstsByStudentId(studentId: string, activeUnit?: string) {
    return db.cST.findMany({
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
      },
    });
  }

  async getCsts(name: any, nim: any, page: any, take: any) {
    return db.cST.findMany({
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
      skip: (page - 1) * take,
      take,
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
      include: {
        CST: true,
      },
    });
  }

  async getCstsBySupervisorIdAndStudentId(
    supervisorId: string | undefined,
    studentId: string,
    activeUnit?: string
  ) {
    return db.cST.findMany({
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
        Student: true,
        supervisor: true,
      },
    });
  }

  async getCstsBySupervisorId(
    supervisorId: string | undefined,
    name: any,
    nim: any,
    page: any,
    take: any
  ) {
    return db.cST.findMany({
      where: {
        supervisorId: supervisorId === null ? undefined : supervisorId,
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
      skip: (page - 1) * take,
      take,
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
      return (
        await db.$transaction([
          db.cST.create({
            data: {
              id,
              studentId,
              unitId,
              endTime: payload.endTime,
              startTime: payload.startTime,
              supervisorId: payload.supervisorId,
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
            "CST",
            getUnixTimestamp(),
            studentId ?? "",
            payload.supervisorId,
            id,
            unitId
          ),
        ])
      )[0];
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert Cst");
      } else {
        return createErrorObject(500);
      }
    }
  }
}
