import { PasswordResetToken } from "../../models/PasswordResetToken";
import { generateRandomString } from "../../utils";
import { EmailHelper } from "../../utils/helper/EmailHelper";
import { IPasswordResetTokenData } from "../../utils/interfaces/PasswordResetToken";
import { UserService } from "./UserService";
import { v4 as uuidv4 } from "uuid";
import { config } from "../../config/Config";

export class PasswordResetTokenService {
  private userService: UserService;
  private passwordResetTokenModel: PasswordResetToken;

  constructor() {
    this.userService = new UserService();
    this.passwordResetTokenModel = new PasswordResetToken();
  }

  async generateTokenResetPassword(email: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      return { error: 404, message: "user's not found" };
    }

    if (!user.email) {
      return { error: 400, message: "user has no email" };
    }

    const testError =
      await this.passwordResetTokenModel.insertPasswordResetToken({
        otp: generateRandomString(5),
        token: uuidv4(),
        username: user.username,
      } as IPasswordResetTokenData);

    if (!("error" in testError)) {
      const emailHelper = new EmailHelper();
      emailHelper.sendEmail({
        html: `<h3>OTP: ${testError.otp}</h3><br>OTP hanya berlaku selama 5 menit<br><h3>${config.config.FRONTEND_RESET_PASSWORD_URI}token=${testError.token}</h3>`,
        subject: "RESIDENT RESET PASSWORD",
        text: "",
        to: user.email,
      });
    }

    return testError;
  }
}
