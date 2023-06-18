import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../../database";
import { PasswordResetToken } from "../../models/PasswordResetToken";
import { createErrorObject } from "../../utils";
import { IPostStudentResetPasswordPayload } from "../../utils/interfaces/Student";
import bcryptjs from "bcryptjs";

export class UserStudentResetPasswordService {
  private passwordResetTokenModel: PasswordResetToken;

  constructor() {
    this.passwordResetTokenModel = new PasswordResetToken();
  }

  async resetPasswordByToken(
    token: string,
    payload: IPostStudentResetPasswordPayload
  ) {
    const tokenResetPassword =
      await this.passwordResetTokenModel.getTokenByToken(token);

    if (!tokenResetPassword) {
      return createErrorObject(404, "token's not found");
    }

    if (tokenResetPassword.tokenExp < new Date().getTime() / 1000) {
      this.passwordResetTokenModel.deleteTokenByToken(token);
      return createErrorObject(400, "token's expired");
    }

    if (tokenResetPassword.otp !== payload.otp) {
      return createErrorObject(400, "otp's incorrect");
    }

    try {
      const resetPasswordOp = await db.$transaction([
        db.user.update({
          where: { username: tokenResetPassword.username },
          data: { password: await bcryptjs.hash(payload.newPassword, 10) },
        }),
        db.passwordResetToken.delete({
          where: { token },
        }),
      ]);
      return null;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed transaction update user and delete password reset token"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }
}
