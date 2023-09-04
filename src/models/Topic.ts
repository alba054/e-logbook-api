import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostTopicPayload } from "../utils/interfaces/Topic";

export class Topic {
  async deleteTopicById(id: number) {
    return db.topic.delete({
      where: {
        id,
      },
    });
  }

  async getTopicById(id: number) {
    return db.topic.findUnique({
      where: {
        id,
      },
    });
  }

  async insertNewUnit(payload: IPostTopicPayload) {
    try {
      return db.topic.create({
        data: {
          name: payload.name,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new unit");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getTopics() {
    return db.topic.findMany();
  }
}
