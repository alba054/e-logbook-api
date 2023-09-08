import { IPostSupervisorPayload } from "../../utils/interfaces/Supervisor";
import bcryptjs from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import db from "../../database";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { createErrorObject } from "../../utils";

export class UserSupervisorRegistrationService {
  constructor() {}

  async registerNewSupervisor(payload: IPostSupervisorPayload) {
    const hashedPassword = await bcryptjs.hash(payload.password, 10);

    try {
      await db.$transaction([
        db.user.create({
          data: {
            id: uuidv4(),
            username: payload.username,
            password: hashedPassword,
            role: payload.roles,
            email: payload.email,
            studentId: undefined,
            badges: {
              connect: payload.badges?.map((b) => {
                return {
                  id: b,
                };
              }),
            },
            supervisor: {
              create: {
                id: uuidv4(),
                supervisorId: payload.supervisorId,
                fullname: payload.firstName + " " + payload.lastName,
                address: payload.address,
                placeOfBirth: payload.placeOfBirth,
                dateOfBirth: payload.dateOfBirth,
                gender: payload.gender,
                unitId: payload.headDivUnit,
                locations: {
                  connect: payload.location?.map((l) => {
                    return { id: l };
                  }),
                },
                units: {
                  connect: payload.units?.map((l) => {
                    return { id: l };
                  }),
                },
              },
            },
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        console.log(error.message);

        return createErrorObject(
          400,
          "failed transaction of creating user and supervisor"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }
}
