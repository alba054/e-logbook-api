import { User } from "../../models/User";
import { IPostUserPayload, IPutUserProfile } from "../../utils/interfaces/User";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";
import { createErrorObject } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";

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

  async deleteUserById(id: string) {
    const user = await this.userModel.getUserById(id);

    if (!user) {
      return createErrorObject(404, "user's not found");
    }

    return this.userModel.deleteUserById(id);
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
    return this.userModel.getUserById(userId);
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
    return this.userModel.getUserByUsername(username);
  }

  async getUserByEmail(email: string) {
    return this.userModel.getUserByEmail(email);
  }
}
