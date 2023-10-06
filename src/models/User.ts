import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { constants, createErrorObject } from "../utils";
import { IPutUserMasterData, IPutUserProfile } from "../utils/interfaces/User";
import bcryptjs from "bcryptjs";

export class User {
  constructor() {}

  async updateUserSupervisorProfileMaster(
    id: string,
    supervisorId: string,
    payload: IPutUserMasterData
  ) {
    return db.$transaction([
      db.user.update({
        where: {
          id,
        },
        data: {
          email: payload.email,
          password: payload.password
            ? await bcryptjs.hash(payload.password, 10)
            : undefined,
          badges: payload.badges
            ? {
                connect: payload.badges.map((b) => {
                  return {
                    id: b,
                  };
                }),
              }
            : undefined,
          username: payload.username,
        },
      }),
      db.supervisor.update({
        where: {
          id: supervisorId,
        },
        data: {
          address: payload.address,
          unitId: payload.headDivUnit,
          fullname: payload.fullName,
          gender: payload.gender,
          dateOfBirth: payload.dateOfBirth,
          placeOfBirth: payload.placeOfBirth,
          locations: payload.location
            ? {
                connect: payload.location.map((b) => {
                  return {
                    id: b,
                  };
                }),
              }
            : undefined,
          units: payload.unit
            ? {
                connect: payload.unit.map((b) => {
                  return {
                    id: b,
                  };
                }),
              }
            : undefined,
        },
      }),
    ]);
  }

  async updateUserStudentProfileMaster(
    id: string,
    payload: IPutUserMasterData
  ) {
    return db.user.update({
      where: {
        id,
      },
      data: {
        email: payload.email,
        password: payload.password
          ? await bcryptjs.hash(payload.password, 10)
          : undefined,
        username: payload.username,
        student: {
          update: {
            address: payload.address,
            fullName: payload.fullName,
            gender: payload.gender,
            dateOfBirth: payload.dateOfBirth,
            placeOfBirth: payload.placeOfBirth,
            studentId: payload.nip,
          },
        },
      },
    });
  }

  async getUserByRoleNameNimBadgeCount(
    role: any,
    name: any,
    nim: any,
    badge: any
  ) {
    return db.user.count({
      where: {
        role,
        badges: { some: badge },
        OR: [
          {
            student: {
              fullName: { contains: name },
              studentId: nim,
            },
          },
          {
            supervisor: {
              fullname: { contains: name },
              supervisorId: nim,
            },
          },
        ],
      },
    });
  }

  async getUserByRoleNameNimBadge(
    role: any,
    name: any,
    nim: any,
    badge: any,
    page: number | undefined,
    take: number | undefined
  ) {
    return db.user.findMany({
      where: {
        role,
        badges: { some: badge },
        OR: [
          {
            student: {
              fullName: { contains: name },
              studentId: nim,
            },
          },
          {
            supervisor: {
              fullname: { contains: name },
              supervisorId: nim,
            },
          },
        ],
      },
      select: {
        id: true,
        student: true,
        supervisor: { include: { locations: true, units: true } },
        badges: true,
        email: true,
        username: true,
        role: true,
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async deleteUserByUsername(username: string) {
    return db.user.delete({
      where: {
        username,
      },
    });
  }

  async deleteUserById(id: string) {
    return db.user.delete({
      where: {
        id,
      },
    });
  }

  async getAllUsersCount() {
    return db.user.count({});
  }

  async getAllUsers(page: number | undefined, take: number | undefined) {
    return db.user.findMany({
      select: {
        id: true,
        student: true,
        supervisor: { include: { locations: true, units: true } },
        badges: true,
        email: true,
        username: true,
        role: true,
      },
      skip: ((page ?? 1) - 1) * (take ?? constants.HISTORY_ELEMENTS_PER_PAGE),
      take: take ?? constants.HISTORY_ELEMENTS_PER_PAGE,
    });
  }

  async updateUserStudentProfile(userId: string, payload: IPutUserProfile) {
    try {
      return db.user.update({
        where: {
          id: userId,
        },
        data: {
          email: payload.email,
          profilePic: payload.pic,
          username: payload.username,
          password: payload.password
            ? await bcryptjs.hash(payload.password, 10)
            : undefined,
          student: {
            update: {
              studentId: payload.nim,
              fullName: payload.fullname,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update user profile");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async updateUserSupervisorProfile(userId: string, payload: IPutUserProfile) {
    try {
      return db.user.update({
        where: {
          id: userId,
        },
        data: {
          email: payload.email,
          profilePic: payload.pic,
          username: payload.username,
          password: payload.password
            ? await bcryptjs.hash(payload.password, 10)
            : undefined,
          supervisor: {
            update: {
              supervisorId: payload.nim,
              fullname: payload.fullname,
            },
          },
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to update user profile");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getUserByUsernameOrStudentIdOrSupervisorId(username: string) {
    return db.user.findFirst({
      where: {
        OR: [
          {
            username,
          },
          {
            student: {
              studentId: username,
            },
          },
          {
            supervisor: {
              supervisorId: username,
            },
          },
        ],
      },
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

  async getUserByResetPasswordToken(token: string) {
    return db.user.findFirst({
      where: {
        PasswordResetToken: {
          some: {
            token,
          },
        },
      },
    });
  }

  async getUserByRole(role: any) {
    return db.user.findMany({
      where: {
        role,
      },
      select: {
        id: true,
        student: true,
        supervisor: true,
        username: true,
        badges: true,
        role: true,
        email: true,
      },
    });
  }

  async getUserById(userId: string) {
    return db.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        badges: true,
        student: {
          include: {
            CheckInCheckOut: true,
            academicAdvisor: true,
            examinerDPK: true,
            supervisingDPK: true,
          },
        },
        supervisor: {
          include: {
            locations: true,
            units: true,
          },
        },
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
            academicAdvisor: true,
            examinerDPK: true,
            supervisingDPK: true,
          },
        },
        supervisor: {
          include: {
            locations: true,
            units: true,
          },
        },
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
