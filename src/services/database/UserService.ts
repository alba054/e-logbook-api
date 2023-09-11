import { User } from "../../models/User";
import {
  IPostUserPayload,
  IPutUserMasterData,
  IPutUserProfile,
} from "../../utils/interfaces/User";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";
import { createErrorObject } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import db from "../../database";

interface IUserData {
  id: string;
  username: string;
  password: string;
  role: "ADMIN";
}

export class UserService {
  private userModel: User;

  constructor() {
    this.userModel = new User();
  }

  async updateUserProfileMaster(id: string, payload: IPutUserMasterData) {
    const user = await this.getUserById(id);

    if (!user || "error" in user) {
      return createErrorObject(404, "user's not found");
    }

    if (user.role === "STUDENT") {
      return this.userModel.updateUserStudentProfileMaster(id, payload);
    }

    return this.userModel.updateUserSupervisorProfileMaster(id, payload);
  }

  async getUserByFilter(role: any, name: any, nim: any, badge: any) {
    return this.userModel.getUserByRoleNameNimBadge(role, name, nim, badge);
  }

  async deleteUserByUsername(username: string) {
    const user = await this.userModel.getUserByUsername(username);

    if (!user) {
      return createErrorObject(404, "user's not found");
    }

    const roleToDelete = user.supervisorId
      ? db.supervisor.delete({
          where: {
            id: user.supervisorId ?? "",
          },
        })
      : db.student.delete({
          where: {
            id: user.studentId ?? "",
          },
        });

    return db.$transaction([
      db.user.delete({
        where: {
          username,
        },
      }),
      roleToDelete,
    ]);
  }

  async deleteUserById(id: string) {
    const user = await this.userModel.getUserById(id);

    if (!user) {
      return createErrorObject(404, "user's not found");
    }

    const roleToDelete = user.supervisorId
      ? db.supervisor.delete({
          where: {
            id: user.supervisorId ?? "",
          },
        })
      : db.student.delete({
          where: {
            id: user.studentId ?? "",
          },
        });
    // return this.userModel.deleteUserById(id);
    return db.$transaction([
      db.user.delete({
        where: {
          id,
        },
      }),
      roleToDelete,
    ]);
  }

  async getAllUsers() {
    return this.userModel.getAllUsers();
  }

  async getUserProfilePictureByUserId(userId: string) {
    const user = await this.userModel.getUserById(userId);

    if (!user?.profilePic) {
      return createErrorObject(404, "no profile picture's uploaded");
    }

    return user?.profilePic;
  }

  async getUserProfilePicture(tokenPayload: ITokenPayload) {
    const user = await this.userModel.getUserByUsername(tokenPayload.username);

    if (!user?.profilePic) {
      return createErrorObject(404, "no profile picture's uploaded");
    }

    return user?.profilePic;
  }

  async updateUserProfile(
    tokenPayload: ITokenPayload,
    payload: IPutUserProfile
  ) {
    if (tokenPayload.role === "STUDENT") {
      return this.userModel.updateUserStudentProfile(
        tokenPayload.userId,
        payload
      );
    }
    return this.userModel.updateUserSupervisorProfile(
      tokenPayload.userId,
      payload
    );
  }

  async getUserByUsernameOrStudentIdOrSupervisorId(username: string) {
    return this.userModel.getUserByUsernameOrStudentIdOrSupervisorId(username);
  }

  async getUserProfileByResetTokenPassword(token: string) {
    const user = await this.userModel.getUserByResetPasswordToken(token);

    if (!user) {
      return createErrorObject(404, "user's not found or token invalid");
    }

    return user;
  }

  async getUserByRole(role: any) {
    return this.userModel.getUserByRole(role);
  }

  async getUserById(userId: string) {
    const user = this.userModel.getUserById(userId);

    if (!user) {
      return createErrorObject(404, "user's not found");
    }

    return user;
  }

  async addNewAdmin(payload: IPostUserPayload) {
    const data: IUserData = {
      id: uuidv4(),
      username: payload.username,
      password: await bcryptjs.hash(payload.password, 10),
      role: "ADMIN",
    };

    return this.userModel.insertNewUserAdmin(data);
  }

  async getUserByUsername(username: string) {
    const user = await this.userModel.getUserByUsername(username);

    if (!user) {
      return createErrorObject(404, "user's not found");
    }

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userModel.getUserByEmail(email);

    if (!user) {
      return createErrorObject(404, "user's not found");
    }

    if (!user.email) {
      return createErrorObject(400, "user has no email");
    }

    return user;
  }
}
