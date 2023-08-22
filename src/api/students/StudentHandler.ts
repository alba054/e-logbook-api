import { NextFunction, Request, Response } from "express";
import { StudentPayloadValidator } from "../../validator/students/StudentValidator";
import {
  IPostStudentPayload,
  IPostStudentResetPasswordPayload,
  IPostStudentTokenResetPassword,
  IPutStudentActiveUnit,
  IPutStudentData,
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
import { ScientificSessionService } from "../../services/database/ScientificSessionService";
import { IStudentScientificSessions } from "../../utils/dto/ScientificSessionDTO";
import { IStudentSelfReflections } from "../../utils/dto/SelfReflectionDTO";
import { SelfReflectionService } from "../../services/database/SelfReflectionService";
import { StudentDataPayloadSchema } from "../../validator/students/StudentSchema";
import { IStudentCases } from "../../utils/dto/CaseDTO";
import { IStudentSkills } from "../../utils/dto/SkillDTO";
import { CompetencyService } from "../../services/database/CompetencyService";
import { DailyActivityService } from "../../services/database/DailyActivityService";
import {
  IActivitiesDetail,
  IListActivitiesPerWeek,
  IStudentDailyActivities,
} from "../../utils/dto/DailyActiveDTO";
import { IPutDailyActivityActivity } from "../../utils/interfaces/DailyActivity";
import { Validator } from "../../validator/Validator";
import { DailyActivityActivityPayloadSchema } from "../../validator/dailyActivities/DailyActivitySchema";

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
  private scientificSessionService: ScientificSessionService;
  private selfReflectionService: SelfReflectionService;
  private competencyService: CompetencyService;
  private dailyActivityService: DailyActivityService;
  private validator: Validator;

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
    this.scientificSessionService = new ScientificSessionService();
    this.selfReflectionService = new SelfReflectionService();
    this.competencyService = new CompetencyService();
    this.dailyActivityService = new DailyActivityService();
    this.validator = new Validator();

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
    this.getStudentScientificSessions =
      this.getStudentScientificSessions.bind(this);
    this.getStudentSelfReflections = this.getStudentSelfReflections.bind(this);
    this.getStudentCases = this.getStudentCases.bind(this);
    this.getStudentSkills = this.getStudentSkills.bind(this);
    this.getDailyActivitiesPerWeek = this.getDailyActivitiesPerWeek.bind(this);
    this.putDailyActivityActivity = this.putDailyActivityActivity.bind(this);
    this.getDailyActivities = this.getDailyActivities.bind(this);
  }

  async getDailyActivities(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const result =
      await this.dailyActivityService.getDailyActivitiesByStudentIdAndUnitId(
        tokenPayload
      );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        unitName: result[0]?.Unit?.name,
        inprocessDailyActivity: result.filter(
          (r) => r.verificationStatus === "INPROCESS"
        ).length,
        verifiedDailyActivity: result.filter(
          (r) => r.verificationStatus === "VERIFIED"
        ).length,
        unverifiedDailyActivity: result.filter(
          (r) => r.verificationStatus === "UNVERIFIED"
        ).length,
        dailyActivities: result.map((r) => {
          return {
            verificationStatus: r.verificationStatus,
            weekName: r.weekNum,
            dailyActivityId: r.id,
            activitiesStatus: r.activities.map((a) => {
              return {
                activityStatus: a.activityStatus,
                day: a.day,
                verificationStatus: a.verificationStatus,
                activityName: a.ActivityName?.name,
                location: a.location?.name,
                detail: a.detail,
              } as IActivitiesDetail;
            }),
          };
        }),
      } as IStudentDailyActivities)
    );
  }

  async putDailyActivityActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutDailyActivityActivity = req.body;

    try {
      const validationResult = this.validator.validate(
        DailyActivityActivityPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const result = await this.dailyActivityService.editDailyActivityActivity(
        tokenPayload,
        id,
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
            "successfully fill daily activity"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getDailyActivitiesPerWeek(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;

    try {
      const result =
        await this.dailyActivityService.getActivitiesByDailyActivityId(
          tokenPayload,
          id
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

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          alpha: result.activities.filter((a) => a.activityStatus !== "ATTEND")
            .length,
          attend: result.activities.filter((a) => a.activityStatus === "ATTEND")
            .length,
          weekName: result.weekNum,
          verificationStatus: result.verificationStatus,
          activities: result.activities.map((a) => {
            return {
              activityStatus: a.activityStatus,
              day: a.day,
              verificationStatus: a.verificationStatus,
              activityName: a.ActivityName?.name,
              detail: a.detail,
              location: a.location?.name,
            } as IActivitiesDetail;
          }),
        } as IListActivitiesPerWeek)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getStudentSkills(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const skills = await this.competencyService.getSkillsByStudentAndUnitId(
      tokenPayload
    );
    const student = await this.userService.getUserByUsername(
      tokenPayload.username
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: student?.student?.studentId,
        studentName: student?.student?.fullName,
        listSkills: skills.map((c) => {
          return {
            skillId: c.id,
            skillName: c.skill?.name,
            skillTypeId: c.skillTypeId,
            skillType: c.competencyType,
            verificationStatus: c.verificationStatus,
          };
        }),
      } as IStudentSkills)
    );
  }

  async getStudentCases(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    tokenPayload;
    const cases = await this.competencyService.getCasesByStudentAndUnitId(
      tokenPayload
    );
    const student = await this.userService.getUserByUsername(
      tokenPayload.username
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: student?.student?.studentId,
        studentName: student?.student?.fullName,
        listCases: cases.map((c) => {
          return {
            caseId: c.id,
            caseName: c.case?.name,
            caseType: c.competencyType,
            caseTypeId: c.caseTypeId,
            verificationStatus: c.verificationStatus,
          };
        }),
      } as IStudentCases)
    );
  }

  async getStudentSelfReflections(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const selfReflections =
      await this.selfReflectionService.getSelfReflectionsByStudentAndUnitId(
        tokenPayload
      );
    const student = await this.userService.getUserByUsername(
      tokenPayload.username
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: student?.student?.studentId,
        studentName: student?.student?.fullName,
        listSelfReflections: selfReflections.map((c) => {
          return {
            content: c.content,
            selfReflectionId: c.id,
            verificationStatus: c.verificationStatus,
          };
        }),
      } as IStudentSelfReflections)
    );
  }

  async getStudentScientificSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const scientificSessions =
      await this.scientificSessionService.getScientificSessionsByStudentAndUnitId(
        tokenPayload
      );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        unverifiedCounts: scientificSessions.unverifiedCounts,
        verifiedCounts: scientificSessions.verifiedCounts,
        listScientificSessions: scientificSessions.scientificSessions.map(
          (c) => {
            return {
              scientificSessionId: c.id,
              supervisorName: c.supervisor.fullname,
              verificationStatus: c.verificationStatus,
              updatedAt: c.updatedAt,
            };
          }
        ),
      } as IStudentScientificSessions)
    );
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

  async putStudentProfile(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutStudentData = req.body;

    try {
      const validationResult = this.studentPayloadValidator.validate(
        StudentDataPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const result = await this.studentService.updateStudentData(
        tokenPayload,
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
            "successfully update student data"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

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
