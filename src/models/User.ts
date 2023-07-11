import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { createErrorObject } from "../utils";

export class User {
  constructor() {}

  async getUserByRole(role: any) {
    return db.user.findMany({
      where: {
        role,
      },
      select: {
        id: true,
        student: true,
        supervisor: true,
      },
    });
  }

  async getUserById(userId: string) {
    return db.user.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async insertNewUserAdmin(payload: {
    id: string;
    username: string;
    password: string;
    role: "ADMIN";
  }) {
    try {
      return db.user.create({
        data: {
          id: payload.id,
          password: payload.password,
          role: payload.role,
          username: payload.username,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to insert new admin");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getUserByUsername(username: string) {
    return db.user.findUnique({
      where: { username },
      include: {
        badges: true,
        student: {
          include: {
            CheckInCheckOut: true,
          },
        },
        supervisor: true,
      },
    });
  }

  async getUserByEmail(email: string) {
    return db.user.findUnique({
      where: {
        email,
      },
    });
  }
}
