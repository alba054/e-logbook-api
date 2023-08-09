import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { IPostManagementRolePayload } from "../utils/interfaces/ManagementRole";
import { createErrorObject } from "../utils";

export class ManagementRole {
  constructor() {}

  async deleteManagementRole(id: string) {
    try {
      return db.managementRole.delete({
        where: {
          id,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete new management role");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async insertManagementRoleByUnitId(
    id: string,
    payload: IPostManagementRolePayload
  ) {
    try {
      return db.managementRole.create({
        data: {
          id,
          roleName: payload.roleName,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new Management types");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getManagementRolesByUnitId() {
    return db.managementRole.findMany();
  }
}
