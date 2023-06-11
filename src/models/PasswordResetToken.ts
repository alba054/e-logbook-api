import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import db from "../database";
import { IPasswordResetTokenData } from "../utils/interfaces/PasswordResetToken";
import { createErrorObject } from "../utils";

export class PasswordResetToken {
  constructor() {}

  async deleteTokenByToken(token: string) {
    try {
      return db.passwordResetToken.delete({ where: { token } });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to delete password reset token");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getTokenByToken(token: string) {
    return db.passwordResetToken.findFirst({
      where: { token },
    });
  }

  async insertPasswordResetToken(data: IPasswordResetTokenData) {
    try {
      const fiveMinutesInSeconds = 5 * 60;

      return db.passwordResetToken.create({
        data: {
          token: data.token,
          otp: data.otp,
          username: data.username,
          tokenExp:
            Math.floor(new Date().getTime() / 1000) + fiveMinutesInSeconds,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to insert new data to table password_reset_tokens"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }
}
