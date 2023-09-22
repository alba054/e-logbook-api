import db from "../../database";
import { IPostStudentPayload } from "../../utils/interfaces/Student";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";
import { createErrorObject } from "../../utils";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UserService } from "../database/UserService";
import { StudentService } from "../database/StudentService";

export class UserStudentRegistrationService {
  private userService: UserService;
  private studentService: StudentService;

  constructor() {
    this.userService = new UserService();
    this.studentService = new StudentService();
  }

  async registerNewUserStudent(payload: IPostStudentPayload) {
    // const user = await this.userService.getUserByUsername(payload.username);
    // const student = await this.studentService.getStudentByStudentId(
    //   payload.studentId
    // );

    // if (!("error" in user) && user) {
    //   return createErrorObject(400, "username has been used");
    // }

    // if ("error" in student && student) {
    //   return createErrorObject(400, "studentId has been used");
    // }

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
                fullName: payload.firstName + " " + (payload.lastName ?? ""),
                address: payload.address,
                placeOfBirth: payload.placeOfBirth,
                dateOfBirth: payload.dateOfBirth,
                gender: payload.gender,
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
