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
import { IListInProcessCheckOutDTO } from "../../utils/dto/StudentCheckOutDTO";
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
import { AssesmentService } from "../../services/database/AssesmentService";
import {
  IListMiniCex,
  IListScientificAssesment,
  IStudentAssesmentUnit,
} from "../../utils/dto/AssesmentDTO";
import { SglService } from "../../services/database/SglService";
import { ISglDetail, IStudentSgl } from "../../utils/dto/SglDTO";
import { ICstDetail, IStudentCst } from "../../utils/dto/CstDTO";
import { CstService } from "../../services/database/CstService";
import { ProblemConsultationService } from "../../services/database/ProblemConsultationService";
import { IStudentProblemConsultations } from "../../utils/dto/ProblemConsultationDTO";
import { IStudentProfileDTO } from "../../utils/dto/StudentProfileDTO";
import { WeeklyAssesmentService } from "../../services/database/WeeklyAssesmentService";
import { IStudentStastic } from "../../utils/dto/StudentDTO";
import { WeekService } from "../../services/database/WeekService";

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
  private assesmentService: AssesmentService;
  private sglService: SglService;
  private cstService: CstService;
  private problemConsultationService: ProblemConsultationService;
  private weeklyAssesmentService: WeeklyAssesmentService;
  private weekService: WeekService;

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
    this.assesmentService = new AssesmentService();
    this.sglService = new SglService();
    this.cstService = new CstService();
    this.problemConsultationService = new ProblemConsultationService();
    this.weeklyAssesmentService = new WeeklyAssesmentService();
    this.weekService = new WeekService();
    this.validator = new Validator();

    this.postStudent = this.postStudent.bind(this);
    this.postStudentForgetPassword = this.postStudentForgetPassword.bind(this);
    this.postStudentResetPassword = this.postStudentResetPassword.bind(this);
    this.getTestAuthorizationStudent =
      this.getTestAuthorizationStudent.bind(this);
    this.putActiveUnit = this.putActiveUnit.bind(this);
    this.getActiveUnit = this.getActiveUnit.bind(this);
    this.postCheckInActiveUnit = this.postCheckInActiveUnit.bind(this);
    this.postCheckOutActiveUnit = this.postCheckOutActiveUnit.bind(this);
    this.getAllCheckInsStudent = this.getAllCheckInsStudent.bind(this);
    this.getAllCheckOutsStudent = this.getAllCheckOutsStudent.bind(this);
    this.putVerificationCheckIn = this.putVerificationCheckIn.bind(this);
    this.putVerificationCheckOut = this.putVerificationCheckOut.bind(this);
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
    this.getMiniCexs = this.getMiniCexs.bind(this);
    this.getScientificAssesments = this.getScientificAssesments.bind(this);
    this.getPersonalBehaviours = this.getPersonalBehaviours.bind(this);
    this.getAssesmentFinalScore = this.getAssesmentFinalScore.bind(this);
    this.getSgls = this.getSgls.bind(this);
    this.getCsts = this.getCsts.bind(this);
    this.getStudentProblemConsultations =
      this.getStudentProblemConsultations.bind(this);
    this.getStudentProfileByStudentId =
      this.getStudentProfileByStudentId.bind(this);
    this.getStudentWeeklyAssesments =
      this.getStudentWeeklyAssesments.bind(this);
    this.getStudentStatistics = this.getStudentStatistics.bind(this);
  }

  async getStudentStatistics(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    // const activeUnit = await this.studentService.getActiveUnit(
    //   tokenPayload.studentId ?? ""
    // );
    const student = await this.studentService.getStudentById(
      tokenPayload.studentId
    );
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const cases = await this.competencyService.getCasesByStudentAndUnitId(
      tokenPayload
    );
    const skills = await this.competencyService.getSkillsByStudentAndUnitId(
      tokenPayload
    );
    const assesments =
      await this.assesmentService.getAssesmentsByStudentIdAndUnitId(
        student?.studentId ?? "",
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

    let finalScore = 0;

    assesments.forEach((a) => {
      let grade = 0;
      if (a.MiniCex) {
        if (a.MiniCex.MiniCexGrade) {
          a.MiniCex.MiniCexGrade.forEach((g) => {
            grade += g.score ?? 0;
          });
          grade = grade / (a.MiniCex.MiniCexGrade.length || 1);
          grade *= a.MiniCex.weight;
        }
      }

      if (a.ScientificAssesment) {
        if (a.ScientificAssesment?.grades) {
          a.ScientificAssesment?.grades.forEach((g) => {
            grade += g.score ?? 0;
          });
          grade = grade / a.ScientificAssesment?.grades.length;
          grade *= a.ScientificAssesment.weight;
        }
      }

      if (a.osce) {
        grade = a.osce.score ?? 0;
        grade *= a.osce.weight;
      }

      if (a.cbt) {
        grade = a.cbt.score ?? 0;
        grade *= a.cbt.weight;
      }

      finalScore = finalScore + grade;
    });

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        totalCases: cases.length,
        totalSkills: skills.length,
        verifiedCases: cases.filter((c) => c.verificationStatus === "VERIFIED")
          .length,
        verifiedSkills: skills.filter(
          (s) => s.verificationStatus === "VERIFIED"
        ).length,
        cases: cases
          .filter((c) => c.verificationStatus === "VERIFIED")
          .map((c) => {
            return {
              caseId: c.id,
              caseName: c.case?.name,
              caseType: c.competencyType,
              caseTypeId: c.caseTypeId,
              verificationStatus: c.verificationStatus,
            };
          }),
        skills: skills
          .filter((c) => c.verificationStatus === "VERIFIED")
          .map((c) => {
            return {
              skillId: c.id,
              skillName: c.skill?.name,
              skillType: c.competencyType,
              skillTypeId: c.skillTypeId,
              verificationStatus: c.verificationStatus,
            };
          }),
        finalScore,
      } as IStudentStastic)
    );
  }

  async getStudentWeeklyAssesments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );
    const student = await this.studentService.getStudentById(
      tokenPayload.studentId
    );

    const weeklyAssesment =
      await this.weeklyAssesmentService.getWeeklyAssesmentByStudentIdAndUnitId(
        student?.studentId ?? "",
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

    const dailyActivities =
      await this.dailyActivityService.getDailyActivitiesByStudentNimAndUnitId(
        tokenPayload.studentId ?? "",
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

    // return res.status(200).json(
    //   createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
    //     studentName: weeklyAssesment[0]?.Student?.fullName,
    //     studentId: weeklyAssesment[0]?.Student?.studentId,
    //     assesments: weeklyAssesment.map((w) => {
    //       return {
    //         attendNum: dailyActivities
    //           .find((a) => a.weekNum === w.weekNum)
    //           ?.activities.filter((a) => a.activityStatus === "ATTEND").length,
    //         notAttendNum: dailyActivities
    //           .find((a) => a.weekNum === w.weekNum)
    //           ?.activities.filter(
    //             (a) =>
    //               a.activityStatus === "NOT_ATTEND" ||
    //               a.activityStatus === "SICK"
    //           ).length,
    //         score: w.score,
    //         verificationStatus: w.verificationStatus,
    //         weekNum: w.weekNum,
    //         id: w.id,
    //       };
    //     }),
    //   } as IStudentWeeklyAssesment)
    // );
  }

  async getStudentProfileByStudentId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { studentId } = req.params;

    try {
      const student = await this.studentService.getStudentByStudentId(
        studentId
      );

      if (student && "error" in student) {
        switch (student.error) {
          case 400:
            throw new BadRequestError(student.message);
          case 404:
            throw new NotFoundError(student.message);
          default:
            throw new InternalServerError();
        }
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          studentId: student.studentId,
          fullName: student.fullName,
          address: student.address,
          email: student.User[0]?.email,
          phoneNumber: student.phoneNumber,
          userId: student.User[0]?.id,
        } as IStudentProfileDTO)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getStudentProblemConsultations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const problemConsultations =
      await this.problemConsultationService.getProblemConsultationsByStudentAndUnitId(
        tokenPayload
      );
    const student = await this.userService.getUserByUsername(
      tokenPayload.username
    );

    if (student && "error" in student) {
      switch (student.error) {
        case 400:
          throw new BadRequestError(student.message);
        case 404:
          throw new NotFoundError(student.message);
        default:
          throw new InternalServerError();
      }
    }

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: student?.student?.studentId,
        studentName: student?.student?.fullName,
        listProblemConsultations: problemConsultations.map((c) => {
          return {
            content: c.problem,
            problemConsultationId: c.id,
            verificationStatus: c.verificationStatus,
            solution: c.solution,
          };
        }),
      } as IStudentProblemConsultations)
    );
  }

  async getCsts(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const result = await this.cstService.getCstsByStudentIdAndUnitId(
      tokenPayload
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: result[0]?.Student?.studentId,
        studentName: result[0]?.Student?.fullName,
        csts: result.map(
          (r) =>
            ({
              createdAt: r.createdAt,
              verificationStatus: r.verificationStatus,
              cstId: r.id,
              endTime: Number(r.endTime),
              startTime: Number(r.startTime),
              supervisorName: r.supervisor.fullname,
              supervisorId: r.supervisor.supervisorId,
              topic: r.topics.map((t) => ({
                topicName: t.topic.map((n) => n.name),
                verificationStatus: t.verificationStatus,
                notes: t.notes,
                id: t.id,
              })),
            } as ICstDetail)
        ),
      } as IStudentCst)
    );
  }

  async getSgls(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const result = await this.sglService.getSglsByStudentIdAndUnitId(
      tokenPayload
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: result[0]?.Student?.studentId,
        studentName: result[0]?.Student?.fullName,
        sgls: result.map(
          (r) =>
            ({
              createdAt: r.createdAt,
              verificationStatus: r.verificationStatus,
              endTime: Number(r.endTime),
              sglId: r.id,
              startTime: Number(r.startTime),
              supervisorId: r.supervisor.supervisorId,
              supervisorName: r.supervisor.fullname,
              topic: r.topics.map((t) => ({
                topicName: t.topic.map((n) => n.name),
                verificationStatus: t.verificationStatus,
                notes: t.notes,
                id: t.id,
              })),
            } as ISglDetail)
        ),
      } as IStudentSgl)
    );
  }

  async getAssesmentFinalScore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const student = await this.studentService.getStudentById(
      tokenPayload.studentId
    );
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const assesments =
      await this.assesmentService.getAssesmentsByStudentIdAndUnitId(
        student?.studentId ?? "",
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

    let finalScore = 0;
    let isFinalScoreShown = true;

    assesments.forEach((a) => {
      let grade = 0;
      if (a.MiniCex) {
        if (a.MiniCex.MiniCexGrade.length) {
          a.MiniCex.MiniCexGrade.forEach((g) => {
            grade += g.score ?? 0;
          });
          grade = grade / a.MiniCex?.MiniCexGrade.length;
        }
      }

      if (a.ScientificAssesment) {
        if (a.ScientificAssesment?.grades) {
          a.ScientificAssesment?.grades.forEach((g) => {
            grade += g.score ?? 0;
          });
          grade = grade / a.ScientificAssesment?.grades.length;
        }
      }

      if (a.osce) {
        grade = a.osce.score ?? 0;
        isFinalScoreShown = a.osce.verified;
      }

      if (a.cbt) {
        grade = a.cbt.score ?? 0;
      }

      finalScore =
        finalScore +
        grade *
          (a.MiniCex?.weight ??
            a.ScientificAssesment?.weight ??
            a.osce?.weight ??
            a.cbt?.weight ??
            0);
    });

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        finalScore: isFinalScoreShown ? finalScore : null,
        assesments: assesments.map((a) => {
          let grade = 0;
          if (a.MiniCex) {
            if (a.MiniCex.MiniCexGrade) {
              a.MiniCex.MiniCexGrade.forEach((g) => {
                grade += g.score ?? 0;
              });
              grade = grade / a.MiniCex?.MiniCexGrade.length;
            }
          }

          if (a.ScientificAssesment) {
            if (a.ScientificAssesment?.grades) {
              a.ScientificAssesment?.grades.forEach((g) => {
                grade += g.score ?? 0;
              });
              grade = grade / a.ScientificAssesment?.grades.length;
            }
          }

          if (a.osce) {
            grade = a.osce.score ?? 0;
          }

          if (a.cbt) {
            grade = a.cbt.score ?? 0;
          }

          return {
            type: a.type,
            weight:
              a.MiniCex?.weight ??
              a.ScientificAssesment?.weight ??
              a.osce?.weight ??
              a.cbt?.weight ??
              0,
            score: grade,
          } as IStudentAssesmentUnit;
        }),
      })
    );
  }

  async getPersonalBehaviours(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const result =
      await this.assesmentService.getPersonalBehavioursByStudentIdAndUnitId(
        tokenPayload
      );

    const student = await this.studentService.getStudentById(
      tokenPayload.studentId
    );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        result.map((r) => {
          return {
            id: r.personalBehaviourId,
            studentId: student?.studentId,
            studentName: student?.fullName,
          } as IListScientificAssesment;
        })
      )
    );
  }

  async getScientificAssesments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const result =
      await this.assesmentService.getScientificAssesmentsByStudentIdAndUnitId(
        tokenPayload
      );

    const student = await this.studentService.getStudentById(
      tokenPayload.studentId
    );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        result.map((r) => {
          return {
            id: r.scientificAssesmentId,
            studentId: student?.studentId,
            studentName: student?.fullName,
            case: r.ScientificAssesment?.title,
            location: r.ScientificAssesment?.location?.name,
          } as IListScientificAssesment;
        })
      )
    );
  }

  async getMiniCexs(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const result = await this.assesmentService.getMiniCexsByStudentIdAndUnitId(
      tokenPayload
    );

    const student = await this.studentService.getStudentById(
      tokenPayload.studentId
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: student?.studentId,
        studentName: student?.fullName,
        data: result.map((r) => {
          return {
            case: r.MiniCex?.case,
            id: r.miniCexId,
            location: r.MiniCex?.location?.name,
          } as IListMiniCex;
        }),
      })
    );
  }

  async getDailyActivities(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const weeks = await this.weekService.getWeeksByUnitId(
      activeUnit?.activeUnit.activeUnit?.id
    );
    const result =
      await this.dailyActivityService.getDailyActivitiesByStudentIdAndUnitId(
        tokenPayload
      );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        weeks: weeks.map((w) => {
          return {
            endDate: Number(w.endDate),
            startDate: Number(w.startDate),
            unitId: w.unitId,
            unitName: w.Unit?.name,
            weekName: w.weekNum,
          };
        }),
        // dailyActivities: result?.weeks.map((r) => {
        //   return {
        //     weekName: r.weekNum,
        //     // activitiesStatus: r.days.map((a) => {
        //     //   return {
        //     //     activityStatus: a.activityStatus,
        //     //     day: a.day,
        //     //     verificationStatus: a.verificationStatus,
        //     //     activityName: a.ActivityName?.name,
        //     //     location: a.location?.name,
        //     //     detail: a.detail,
        //     //   } as IActivitiesDetail;
        //     // }),
        //   };
        // }),
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

      // return res.status(200).json(
      //   createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
      //     alpha: result.activities.filter((a) => a.activityStatus !== "ATTEND")
      //       .length,
      //     attend: result.activities.filter((a) => a.activityStatus === "ATTEND")
      //       .length,
      //     weekName: result.weekNum,
      //     verificationStatus: result.verificationStatus,
      //     activities: result.activities.map((a) => {
      //       return {
      //         activityStatus: a.activityStatus,
      //         day: a.day,
      //         verificationStatus: a.verificationStatus,
      //         activityName: a.ActivityName?.name,
      //         detail: a.detail,
      //         location: a.location?.name,
      //         id: a.id,
      //       } as IActivitiesDetail;
      //     }),
      //   } as IListActivitiesPerWeek)
      // );
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

    if (student && "error" in student) {
      switch (student.error) {
        case 400:
          throw new BadRequestError(student.message);
        case 404:
          throw new NotFoundError(student.message);
        default:
          throw new InternalServerError();
      }
    }

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

    if (student && "error" in student) {
      switch (student.error) {
        case 400:
          throw new BadRequestError(student.message);
        case 404:
          throw new NotFoundError(student.message);
        default:
          throw new InternalServerError();
      }
    }

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

    if (student && "error" in student) {
      switch (student.error) {
        case 400:
          throw new BadRequestError(student.message);
        case 404:
          throw new NotFoundError(student.message);
        default:
          throw new InternalServerError();
      }
    }

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

  async putVerificationCheckOut(
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
        await this.studentCheckInCheckOutService.verifyStudentCheckOut(
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
            "successfully verify checkout"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getAllCheckInsStudent(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const studentCheckIns =
      await this.checkInCheckOutService.getAllCheckInStudents(
        tokenPayload.supervisorId ?? ""
      );

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

  async getAllCheckOutsStudent(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { userId, supervisorId } = res.locals.user as ITokenPayload;
    const studentCheckIns =
      await this.checkInCheckOutService.getAllCheckOutStudents(
        userId,
        supervisorId ?? ""
      );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        studentCheckIns.map((s) => {
          return {
            checkOutStatus: s.checkOutStatus,
            checkOutTime: Number(s.checkOutTime),
            fullname: s.student.fullName,
            studentId: s.student.studentId,
            unitId: s.unit.id,
            unitName: s.unit.name,
          } as IListInProcessCheckOutDTO;
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

  async postCheckOutActiveUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { studentId } = res.locals.user as ITokenPayload;

    try {
      if (!studentId) {
        throw new InternalServerError();
      }

      const result =
        await this.studentCheckInCheckOutService.studentCheckOutActiveUnit(
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
            "successfully check out"
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
          countCheckIn: result?.checkInCheckOutUnit?.countCheckIn,
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
