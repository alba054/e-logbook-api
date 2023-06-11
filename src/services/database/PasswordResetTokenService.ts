import { PasswordResetToken } from "../../models/PasswordResetToken";
import { generateRandomString } from "../../utils";
import { IPasswordResetTokenData } from "../../utils/interfaces/PasswordResetToken";
import { IPostStudentResetPasswordPayload } from "../../utils/interfaces/Student";
import { UserService } from "./UserService";
import { v4 as uuidv4 } from "uuid";

export class PasswordResetTokenService {
  private userService: UserService;
  private passwordResetTokenModel: PasswordResetToken;

  constructor() {
    this.userService = new UserService();
    this.passwordResetTokenModel = new PasswordResetToken();
  }

  async generateTokenResetPassword(username: string) {
    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      return { error: 404, message: "user's not found" };
    }

    if (!user.email) {
      return { error: 400, message: "user has no email" };
    }

    // todo: send link to mail
    // todo ---
    const testError =
      await this.passwordResetTokenModel.insertPasswordResetToken({
        otp: generateRandomString(5),
        token: uuidv4(),
        username,
      } as IPasswordResetTokenData);

    return testError;
  }
}
