import db from "../../database";
import { IPostStudentPayload } from "../../utils/interfaces/Student";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";
import { createErrorObject } from "../../utils";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class UserStudentRegistrationService {
  constructor() {}

  async registerNewUserStudent(payload: IPostStudentPayload) {
    const hashedPassword = await bcryptjs.hash(payload.password, 10);

    try {
      await db.$transaction([
        db.user.create({
          data: {
            id: uuidv4(),
            username: payload.username,
            password: hashedPassword,
            role: "STUDENT",
            email: payload.email,
            student: {
              create: {
                id: uuidv4(),
                studentId: payload.studentId,
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
          "failed transaction of creating user and student"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }
}
