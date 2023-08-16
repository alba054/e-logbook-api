import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";
import { IPostSkillTypesPayload } from "../utils/interfaces/SkillTypes";

export class SkillTypes {
  async deleteSkillTypes(id: number) {
    try {
      return db.skillType.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete new skill types");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertSkillTypesByUnitId(payload: IPostSkillTypesPayload) {
    try {
      return db.skillType.create({
        data: {
          name: payload.name,
          unitId: payload.unitId,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new affected parts");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getSkillTypesByUnitId(unitId: string) {
    return db.skillType.findMany({
      where: {
        unitId,
      },
    });
  }
}
