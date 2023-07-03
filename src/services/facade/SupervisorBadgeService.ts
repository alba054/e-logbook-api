import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../../database";
import { createErrorObject } from "../../utils";
import { IPostSupervisorBadgePayload } from "../../utils/interfaces/Supervisor";
import { UserService } from "../database/UserService";

export class SupervisorBadgeService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  async assignBadgeToSupervisor(payload: IPostSupervisorBadgePayload) {
    try {
      const user = await this.userService.getUserById(payload.supervisorId);

      if (!user) {
        return createErrorObject(404, "user's not found");
      }

      if (user.role !== "SUPERVISOR") {
        return createErrorObject(400, "this user isn't supervisor");
      }

      const ops = [];
      for (let i = 0; i < payload.badges.length; i++) {
        ops.push(
          db.user.update({
            where: {
              id: payload.supervisorId,
            },
            data: {
              badges: {
                connect: {
                  id: payload.badges[i],
                },
              },
            },
          })
        );
      }

      await db.$transaction(ops);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log(error.message);

        return createErrorObject(
          400,
          "failed transaction of assigning badge to supervisor"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }
}
