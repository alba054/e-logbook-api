import { NextFunction, Request, Response } from "express";
import { StudentPayloadValidator } from "../../validator/students/StudentValidator";
import {
  IPostStudentPayload,
  IPostStudentResetPasswordPayload,
} from "../../utils/interfaces/Student";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { AuthenticationService } from "../../services/facade/AuthenticationService";
import { UnauthenticatedError } from "../../exceptions/httpError/UnauthenticatedError";
import { constants, createResponse } from "../../utils";
import { UserStudentRegistrationService } from "../../services/facade/UserStudentRegistrationService";
import { PasswordResetTokenService } from "../../services/database/PasswordResetTokenService";
import { config } from "../../config/Config";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { UserStudentResetPasswordService } from "../../services/facade/UserStudentResetPasswordService";

export class StudentHandler {
  private studentPayloadValidator: StudentPayloadValidator;
  private authenticationService: AuthenticationService;
  private userStudentRegistrationService: UserStudentRegistrationService;
  private passwordResetTokenService: PasswordResetTokenService;
  private userStudentResetPasswordService: UserStudentResetPasswordService;

  constructor() {
    this.authenticationService = new AuthenticationService();
    this.studentPayloadValidator = new StudentPayloadValidator();
    this.userStudentRegistrationService = new UserStudentRegistrationService();
    this.passwordResetTokenService = new PasswordResetTokenService();
    this.userStudentResetPasswordService =
      new UserStudentResetPasswordService();

    this.postStudent = this.postStudent.bind(this);
    this.getStudentForgetPassword = this.getStudentForgetPassword.bind(this);
    this.postStudentResetPassword = this.postStudentResetPassword.bind(this);
  }

  async postStudentResetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { username, token } = req.params;
    const payload: IPostStudentResetPasswordPayload = req.body;

    try {
      if (
        !this.authenticationService.authenticateAdmin(
          res.locals.credential.username,
          res.locals.credential.password
        )
      ) {
        throw new UnauthenticatedError("provide valid credential");
      }

      const testValidate =
        this.studentPayloadValidator.validateStudentResetPasswordPayload(
          payload
        );

      if (testValidate && "error" in testValidate) {
        throw new BadRequestError(testValidate.error.message);
      }

      const resetPassword =
        await this.userStudentResetPasswordService.resetPasswordByUsername(
          username,
          token,
          payload
        );

      if (resetPassword && "error" in resetPassword) {
        switch (resetPassword.error) {
          case 400:
            throw new BadRequestError(resetPassword.message ?? "");
          case 404:
            throw new NotFoundError(resetPassword.message ?? "");
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            `successfully reset password`
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getStudentForgetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { username } = req.params;
    try {
      const token =
        await this.passwordResetTokenService.generateTokenResetPassword(
          username
        );

      if ("error" in token) {
        switch (token.error) {
          case 400:
            throw new BadRequestError(token.message ?? "");
          case 404:
            throw new NotFoundError(token.message ?? "");
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(201)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            `${config.config.FRONTEND_HOST}/${token.token}`
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postStudent(req: Request, res: Response, next: NextFunction) {
    const payload: IPostStudentPayload = req.body;

    try {
      if (
        !this.authenticationService.authenticateAdmin(
          res.locals.credential.username,
          res.locals.credential.password
        )
      ) {
        throw new UnauthenticatedError("provide valid credential");
      }
      const testValidate =
        this.studentPayloadValidator.validatePostPayload(payload);

      if (testValidate && "error" in testValidate) {
        throw new BadRequestError(testValidate.error.message);
      }

      const testError =
        await this.userStudentRegistrationService.registerNewUserStudent(
          payload
        );

      if (testError && "error" in testError) {
        switch (testError.error) {
          case 400:
            throw new BadRequestError(testError.message ?? "");
          case 404:
            throw new NotFoundError(testError.message ?? "");
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(201)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully register a new student with id " + payload.studentId
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
