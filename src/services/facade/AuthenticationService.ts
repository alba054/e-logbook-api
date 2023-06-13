import { config } from "../../config/Config";
import { createErrorObject } from "../../utils";
import { tokenGenerator } from "../../utils/auth/TokenGenerator";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { UserService } from "../database/UserService";

export class AuthenticationService {
  private userService: UserService;
  constructor() {
    this.userService = new UserService();
  }

  async generateToken(
    payload: ITokenPayload | { error: number; message: string }
  ) {
    if (!config.config.ACCESS_SECRET_KEY || !config.config.REFRESH_SECRET_KEY) {
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
      config.config.ACCESS_SECRET_KEY,
      "exp" in payload || "iss" in payload ? undefined : accessTokenClaims
    );

    const refreshToken = await tokenGenerator.sign(
      payload,
      config.config.REFRESH_SECRET_KEY,
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
