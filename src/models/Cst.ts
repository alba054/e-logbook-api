import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject, getUnixTimestamp } from "../utils";
import {
  IPostCST,
  IPostCSTTopic,
  IPutCST,
  IPutCstTopicVerificationStatus,
} from "../utils/interfaces/Cst";
import { History } from "./History";

export class Cst {
 
 
  private historyModel: History;

  constructor() {
    this.historyModel = new History();
  }

  async deleteCstById(id: string) {
    return db.cST.delete({
        where: {
          id
        },
      });
  }

  async ediCstById(id: string, payload: IPutCST) {
    return db.$transaction([
      ...payload.topics?.map(t => {
        return db.cstTopic.delete({
          where: {
            id: t.oldId
          }
        })
      }) ?? [],
      ...payload.topics?.map(t => {
        return db.cstTopic.create({
          data: {
            id: t.oldId,
            CST: {
              connect: {
                id
              }
            },
            topic: {
              connect: {
                id: t.newId
              }
            }
          }
        })
      }) ?? [],
      db.cST.update({
        where: {
          id
        },
        data: {
          createdAt: payload.date ? new Date(payload.date) : new Date(),
          endTime: payload.endTime,
          startTime: payload.startTime,     
        }
      }),
    ])
  }

  async getCstsWithoutPage() {
    return db.cST.findMany({
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

  async getCstsBySupervisorIdWithoutPage(supervisorId: string | undefined) {
    return db.cST.findMany({
      where: {
        supervisorId: supervisorId === null ? undefined : supervisorId,
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
      orderBy: {
        updatedAt: "desc",
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
      orderBy: {
        updatedAt: "desc",
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
      orderBy: {
        updatedAt: "desc",
      },
      skip: (page - 1) * take,
      take,
    });
  }

  async verifyCstById(id: string, payload: IPutCstTopicVerificationStatus) {
    try {
        const cstSelect = await db.cST.findUnique(
        {
          where: {
            id,
          }
        }
      );
      return db.$transaction([
        db.cST.update({
        where: {
          id,
        },
        data: {
          verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
        },
      }),
       this.historyModel.insertHistoryAsync(
            "CST",
            getUnixTimestamp(),
            cstSelect?.studentId ?? '',
            cstSelect?.supervisorId ?? '',
            id,
            cstSelect?.unitId?? ''
          ),
      ]);
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
        topics: {
          include: {
            topic: true,
          },
        },
        Student: true,
        supervisor: true,
        Unit: true
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
      orderBy: {
        updatedAt: "desc",
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
      orderBy: {
        updatedAt: "desc",
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
