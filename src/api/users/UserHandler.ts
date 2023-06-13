import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { AuthenticationService } from "../../services/facade/AuthenticationService";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { UnauthenticatedError } from "../../exceptions/httpError/UnauthenticatedError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";

export class UserHandler {
  private authenticationService: AuthenticationService;

  constructor() {
    this.authenticationService = new AuthenticationService();

    this.postRefreshToken = this.postRefreshToken.bind(this);
    this.postUserLogin = this.postUserLogin.bind(this);
  }

  async postRefreshToken(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body;

    try {
      if (!refreshToken) {
        throw new BadRequestError("provide refresh token in body");
      }

      if (!process.env.ACCESS_SECRET_KEY || !process.env.REFRESH_SECRET_KEY) {
        throw new InternalServerError();
      }

      const decoded = await this.authenticationService.verifyToken(
        refreshToken,
        process.env.REFRESH_SECRET_KEY
      );

      if (decoded && "error" in decoded) {
        throw new BadRequestError(decoded.message as string);
      }

      const token = await this.authenticationService.generateToken(decoded);

      if ("error" in token) {
        switch (token.error) {
          case 404:
            throw new NotFoundError("user's not found");
          case 401:
            throw new UnauthenticatedError("password's incorrect");
          default:
            throw new InternalServerError();
        }
      }
      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, token));
    } catch (error) {
      return next(error);
    }
  }

  async postUserLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const payload = await this.authenticationService.authenticate(
        res.locals.credential.username,
        res.locals.credential.password
      );

      const token = await this.authenticationService.generateToken(payload);

      if (token && "error" in token) {
        switch (token.error) {
          case 404:
            throw new NotFoundError(token.message);
          case 401:
            throw new UnauthenticatedError(token.message);
          default:
            throw new InternalServerError();
        }
      }
      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, token));
    } catch (error) {
      return next(error);
    }
  }
}
