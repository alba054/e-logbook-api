import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { AuthenticationService } from "../../services/facade/AuthenticationService";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { UnauthenticatedError } from "../../exceptions/httpError/UnauthenticatedError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { config } from "../../config/Config";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { UserService } from "../../services/database/UserService";
import { IUserProfileDTO } from "../../utils/dto/UserProfileDTO";
import { IPostUserPayload } from "../../utils/interfaces/User";
import { UserPayloadValidator } from "../../validator/users/UserValidator";

export class UserHandler {
  private authenticationService: AuthenticationService;
  private userService: UserService;
  private userValidator: UserPayloadValidator;

  constructor() {
    this.authenticationService = new AuthenticationService();
    this.userService = new UserService();
    this.userValidator = new UserPayloadValidator();

    this.postRefreshToken = this.postRefreshToken.bind(this);
    this.postUserLogin = this.postUserLogin.bind(this);
    this.getUserProfile = this.getUserProfile.bind(this);
    this.postUser = this.postUser.bind(this);
  }

  async postUser(req: Request, res: Response, next: NextFunction) {
    const payload: IPostUserPayload = req.body;

    try {
      const validationResult = this.userValidator.validatePostPayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const testError = await this.userService.addNewAdmin(payload);

      if (testError && "error" in testError) {
        switch (testError.error) {
          case 400:
            throw new BadRequestError(testError.message);
          case 404:
            throw new NotFoundError(testError.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(201)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully register a new admin"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getUserProfile(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const user = await this.userService.getUserByUsername(
      tokenPayload.username
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        badges: user?.badges,
        id: user?.id,
        role: user?.role,
        username: user?.username,
        email: user?.email,
        student: user?.student,
        supervisor: user?.supervisor,
      } as IUserProfileDTO)
    );
  }

  async postRefreshToken(req: Request, res: Response, next: NextFunction) {
    const { refreshToken } = req.body;

    try {
      if (!refreshToken) {
        throw new BadRequestError("provide refresh token in body");
      }

      if (
        !config.config.ACCESS_SECRET_KEY ||
        !config.config.REFRESH_SECRET_KEY
      ) {
        throw new InternalServerError();
      }

      const decoded = await this.authenticationService.verifyToken(
        refreshToken,
        config.config.REFRESH_SECRET_KEY
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
      const token = await this.authenticationService.generateToken(
        res.locals.user
      );

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, token));
    } catch (error) {
      return next(error);
    }
  }
}
