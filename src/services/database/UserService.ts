import { User } from "../../models/User";
import { IPostUserPayload } from "../../utils/interfaces/User";
import { v4 as uuidv4 } from "uuid";
import bcryptjs from "bcryptjs";
import { createErrorObject } from "../../utils";

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
