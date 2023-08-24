import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostScientificAssesmentGradeItemPayload } from "../utils/interfaces/ScientificAssesmentGradeItem";

export class ScientificAssesmentGradeItem {
  constructor() {}

  async deleteScientificAssesmentGradeItem(id: number) {
    try {
      return db.scientificAssesmentGradeItem.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to delete new scientific assesment grade item"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertScientificAssesmentGradeItemByUnitId(
    payload: IPostScientificAssesmentGradeItemPayload
  ) {
    try {
      return db.scientificAssesmentGradeItem.create({
        data: {
          name: payload.name,
          scientificGradeType: payload.type,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to insert new scientific assesment grade item"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getScientificAssesmentGradeItemsByUnitId() {
    return db.scientificAssesmentGradeItem.findMany();
  }
}
