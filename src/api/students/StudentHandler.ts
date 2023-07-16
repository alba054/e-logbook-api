import { NextFunction, Request, Response } from "express";
import { StudentPayloadValidator } from "../../validator/students/StudentValidator";
import {
  IPostStudentPayload,
  IPostStudentResetPasswordPayload,
  IPostStudentTokenResetPassword,
  IPutStudentActiveUnit,
} from "../../utils/interfaces/Student";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { constants, createResponse } from "../../utils";
import { UserStudentRegistrationService } from "../../services/facade/UserStudentRegistrationService";
import { PasswordResetTokenService } from "../../services/database/PasswordResetTokenService";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { UserStudentResetPasswordService } from "../../services/facade/UserStudentResetPasswordService";
import { StudentService } from "../../services/database/StudentService";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentCheckInCheckOutService } from "../../services/facade/StudentCheckInCheckOutService";
import { IActiveUnitDTO } from "../../utils/dto/ActiveUnitDTO";
import { IListInProcessCheckInDTO } from "../../utils/dto/StudentCheckInDTO";
import { CheckInCheckOutValidator } from "../../validator/checkInCheckOut/CheckInCheckOutValidator";
import { CheckInCheckOutService } from "../../services/database/CheckInCheckOutService";
import { ClinicalRecordService } from "../../services/database/ClinicalRecordService";
import { IStudentClinicalRecods } from "../../utils/dto/ClinicalRecordDTO";
import { UserService } from "../../services/database/UserService";

export class StudentHandler {
  private studentPayloadValidator: StudentPayloadValidator;
  private userStudentRegistrationService: UserStudentRegistrationService;
  private passwordResetTokenService: PasswordResetTokenService;
  private userStudentResetPasswordService: UserStudentResetPasswordService;
  private studentService: StudentService;
  private studentCheckInCheckOutService: StudentCheckInCheckOutService;
  private checkInCheckOutValidator: CheckInCheckOutValidator;
  private checkInCheckOutService: CheckInCheckOutService;
  private clinicalRecordService: ClinicalRecordService;
  private userService: UserService;

  constructor() {
    this.studentPayloadValidator = new StudentPayloadValidator();
    this.checkInCheckOutValidator = new CheckInCheckOutValidator();
    this.userStudentRegistrationService = new UserStudentRegistrationService();
    this.passwordResetTokenService = new PasswordResetTokenService();
    this.userStudentResetPasswordService =
      new UserStudentResetPasswordService();
    this.studentService = new StudentService();
    this.studentCheckInCheckOutService = new StudentCheckInCheckOutService();
    this.checkInCheckOutService = new CheckInCheckOutService();
    this.clinicalRecordService = new ClinicalRecordService();
    this.userService = new UserService();

    this.postStudent = this.postStudent.bind(this);
    this.postStudentForgetPassword = this.postStudentForgetPassword.bind(this);
    this.postStudentResetPassword = this.postStudentResetPassword.bind(this);
    this.getTestAuthorizationStudent =
      this.getTestAuthorizationStudent.bind(this);
    this.putActiveUnit = this.putActiveUnit.bind(this);
    this.getActiveUnit = this.getActiveUnit.bind(this);
    this.postCheckInActiveUnit = this.postCheckInActiveUnit.bind(this);
    this.getAllCheckInsStudent = this.getAllCheckInsStudent.bind(this);
    this.putVerificationCheckIn = this.putVerificationCheckIn.bind(this);
    this.putStudentProfile = this.putStudentProfile.bind(this);
    this.putStudentSupervisors = this.putStudentSupervisors.bind(this);
    this.getStudentClinicalRecords = this.getStudentClinicalRecords.bind(this);
    this.getStudentProfileByResetPasswordToken =
      this.getStudentProfileByResetPasswordToken.bind(this);
  }

  async getStudentProfileByResetPasswordToken(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { token } = req.params;

    try {
      const result = await this.userService.getUserProfileByResetTokenPassword(
        token
      );

      if (result && "error" in result) {
        switch (result.error) {
          case 400:
            throw new BadRequestError(result.message);
          case 404:
            throw new NotFoundError(result.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, result.email));
    } catch (error) {
      return next(error);
    }
  }

  async getStudentClinicalRecords(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const clinicalRecords =
      await this.clinicalRecordService.getClinicalRecordsByStudentAndUnitId(
        tokenPayload
      );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        unverifiedCounts: clinicalRecords.unverifiedCounts,
        verifiedCounts: clinicalRecords.verifiedCounts,
        listClinicalRecords: clinicalRecords.clinicalRecords.map((c) => {
          return {
            clinicalRecordId: c.id,
            patientName: c.patientName,
            supervisorName: c.supervisor.fullname,
            verificationStatus: c.verificationStatus,
          };
        }),
      } as IStudentClinicalRecods)
    );
  }

  // todo: assign student supervisors
  async putStudentSupervisors(
    req: Request,
    res: Response,
    next: NextFunction
  ) {}

  // todo: edit profile handler
  async putStudentProfile(req: Request, res: Response, next: NextFunction) {}

  async putVerificationCheckIn(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;
    const payload: { verified: boolean } = req.body;

    try {
      const validationResult =
        this.checkInCheckOutValidator.validateCheckInVerificationPayload(
          payload
        );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const result =
        await this.studentCheckInCheckOutService.verifyStudentCheckIn(
          studentId,
          tokenPayload.userId,
          payload
        );

      if (result && "error" in result) {
        switch (result.error) {
          case 400:
            throw new BadRequestError(result.message);
          case 404:
            throw new NotFoundError(result.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully verify checkin"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getAllCheckInsStudent(req: Request, res: Response, next: NextFunction) {
    const studentCheckIns =
      await this.checkInCheckOutService.getAllCheckInStudents();

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        studentCheckIns.map((s) => {
          return {
            checkInStatus: s.checkInStatus,
            checkInTime: Number(s.checkInTime),
            fullname: s.student.fullName,
            studentId: s.student.studentId,
            unitId: s.unit.id,
            unitName: s.unit.name,
          } as IListInProcessCheckInDTO;
        })
      )
    );
  }

  async postCheckInActiveUnit(req: Request, res: Response, next: NextFunction) {
    const { studentId } = res.locals.user as ITokenPayload;

    try {
      if (!studentId) {
        throw new InternalServerError();
      }

      const result =
        await this.studentCheckInCheckOutService.studentCheckInActiveUnit(
          studentId
        );

      if (result && "error" in result) {
        switch (result.error) {
          case 400:
            throw new BadRequestError(result.message);
          case 404:
            throw new NotFoundError(result.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(201)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully check in"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getActiveUnit(req: Request, res: Response, next: NextFunction) {
    const { studentId } = res.locals.user as ITokenPayload;

    try {
      if (!studentId) {
        throw new InternalServerError();
      }

      const result = await this.studentService.getActiveUnit(studentId);
      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          checkInStatus: result?.checkInCheckOutUnit?.checkInStatus,
          checkOutStatus: result?.checkInCheckOutUnit?.checkOutStatus,
          unitId: result?.activeUnit.activeUnit?.id,
          unitName: result?.activeUnit.activeUnit?.name,
          checkInTime: Number(result?.checkInCheckOutUnit?.checkInTime),
          checkOutTime: Number(result?.checkInCheckOutUnit?.checkOutTime),
        } as IActiveUnitDTO)
      );
    } catch (error) {
      return next(error);
    }
  }

  async putActiveUnit(req: Request, res: Response, next: NextFunction) {
    const payload: IPutStudentActiveUnit = req.body;
    const { studentId } = res.locals.user as ITokenPayload;

    try {
      if (!studentId) {
        throw new InternalServerError();
      }

      const testValidate =
        this.studentPayloadValidator.validateStudentActiveUnitPayload(payload);

      if (testValidate && "error" in testValidate) {
        throw new BadRequestError(testValidate.message);
      }

      const result = await this.studentService.setActiveUnit(
        studentId,
        payload
      );

      if (result && "error" in result) {
        switch (result.error) {
          case 400:
            throw new BadRequestError(result.message);
          case 404:
            throw new NotFoundError(result.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            `succesfully change active unit to ${result.unitId}`
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getTestAuthorizationStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    return res
      .status(200)
      .json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, res.locals.user)
      );
  }

  async postStudentResetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { token } = req.params;
    const payload: IPostStudentResetPasswordPayload = req.body;

    try {
      // if (
      //   !this.authenticationService.authenticateAdmin(
      //     res.locals.credential.username,
      //     res.locals.credential.password
      //   )
      // ) {
      //   throw new UnauthenticatedError("provide valid credential");
      // }

      const testValidate =
        this.studentPayloadValidator.validateStudentResetPasswordPayload(
          payload
        );

      if (testValidate && "error" in testValidate) {
        throw new BadRequestError(testValidate.message);
      }

      const resetPassword =
        await this.userStudentResetPasswordService.resetPasswordByToken(
          token,
          payload
        );

      if (resetPassword && "error" in resetPassword) {
        switch (resetPassword.error) {
          case 400:
            throw new BadRequestError(resetPassword.message);
          case 404:
            throw new NotFoundError(resetPassword.message);
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

  async postStudentForgetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const payload: IPostStudentTokenResetPassword = req.body;
    try {
      const validationResult =
        this.studentPayloadValidator.validateStudentTokenResetPasswordPayload(
          payload
        );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const token =
        await this.passwordResetTokenService.generateTokenResetPassword(
          payload.email
        );

      if ("error" in token) {
        switch (token.error) {
          case 400:
            throw new BadRequestError(token.message);
          case 404:
            throw new NotFoundError(token.message);
          default:
            throw new InternalServerError();
        }
      }

      return res.status(201).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          token: token.token,
          otp: token.otp,
        })
      );
    } catch (error) {
      return next(error);
    }
  }

  async postStudent(req: Request, res: Response, next: NextFunction) {
    const payload: IPostStudentPayload = req.body;

    try {
      // if (
      //   !this.authenticationService.authenticateAdmin(
      //     res.locals.credential.username,
      //     res.locals.credential.password
      //   )
      // ) {
      //   throw new UnauthenticatedError("provide valid credential");
      // }

      const testValidate =
        this.studentPayloadValidator.validatePostPayload(payload);

      if (testValidate && "error" in testValidate) {
        throw new BadRequestError(testValidate.message);
      }

      const testError =
        await this.userStudentRegistrationService.registerNewUserStudent(
          payload
        );

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
            "successfully register a new student with id " + payload.studentId
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
