import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostPersonalBehaviourGradeItemPayload } from "../utils/interfaces/PersonalBehaviourGradeItem";

export class PersonalBehaviourGradeItem {
  constructor() {}

  async deletePersonalBehaviourGradeItem(id: number) {
    try {
      return db.personalBehaviourGradeItem.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to delete new personal behaviour grade item"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertPersonalBehaviourGradeItemByUnitId(
    payload: IPostPersonalBehaviourGradeItemPayload
  ) {
    try {
      return db.personalBehaviourGradeItem.create({
        data: {
          name: payload.name,
          personalBehaviourGradeType: payload.type,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to insert new personal behaviour grade item"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getPersonalBehaviourGradeItemsByUnitId() {
    return db.personalBehaviourGradeItem.findMany();
  }
}
