import { config } from "../../config/Config";
import { createErrorObject } from "../../utils";
import { tokenGenerator } from "../../utils/auth/TokenGenerator";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { UserService } from "../database/UserService";
import bcryptjs from "bcryptjs";

export class AuthenticationService {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  authenticateAdmin(username: string, password: string) {
    return (
      username === config.config.ADMIN_USERNAME &&
      password === config.config.ADMIN_PASSWORD
    );
  }

  async authenticate(username: string, password: string) {
    // todo: authenticate user
    // todo: it will get user from UserService by username
    // todo: and send locals to next handler
    const user = await this.userService.getUserByUsername(username);

    if (!user) {
      return createErrorObject(404, "user's not found");
    }

    const passwordIsCorrect = await bcryptjs.compare(
      password,
      user.password as string
    );

    if (!passwordIsCorrect) {
      return createErrorObject(401, "password is incorrect");
    }

    return {
      username: user.username,
      email: user.email,
      role: user.role,
      badges: user.badges.map((badge) => badge.name),
    } as ITokenPayload;
  }

  async generateToken(
    payload: ITokenPayload | { error: number; message: string }
  ) {
    if (!process.env.ACCESS_SECRET_KEY || !process.env.REFRESH_SECRET_KEY) {
      return createErrorObject(500);
    }

    if ("error" in payload) {
      return payload;
    }

    let accessTokenClaims = { subject: payload.username };
    let refreshTokenClaims = { subject: payload.username };

    Object.assign(accessTokenClaims, config.config.ACCESS_TOKEN_CLAIMS);
    Object.assign(refreshTokenClaims, config.config.REFRESH_TOKEN_CLAIMS);

    const accessToken = await tokenGenerator.sign(
      payload,
      process.env.ACCESS_SECRET_KEY,
      "exp" in payload || "iss" in payload ? undefined : accessTokenClaims
    );

    const refreshToken = await tokenGenerator.sign(
      payload,
      process.env.REFRESH_SECRET_KEY,
      "exp" in payload || "iss" in payload ? undefined : refreshTokenClaims
    );

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string, secretKey: string) {
    try {
      const decoded = await tokenGenerator.verify(token, secretKey, {
        issuer: config.config.TOKEN_ISSUER,
      });
      return !decoded ? createErrorObject(404, "payload's not found") : decoded;
    } catch (error) {
      return { error: 400, message: error };
    }
  }
}
