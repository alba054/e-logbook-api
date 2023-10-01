import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { AssesmentService } from "../../services/database/AssesmentService";
import { CompetencyService } from "../../services/database/CompetencyService";
import { StudentService } from "../../services/database/StudentService";
import { UserService } from "../../services/database/UserService";
import { SupervisorBadgeService } from "../../services/facade/SupervisorBadgeService";
import { UserSupervisorRegistrationService } from "../../services/facade/UserSupervisorRegistrationService";
import { constants, createResponse } from "../../utils";
import {
  IListSupervisorStudent,
  IStudentStastic,
} from "../../utils/dto/StudentDTO";
import { ISupervisorProfileDTO } from "../../utils/dto/SupervisorDTO";
import {
  IPostSupervisorBadgePayload,
  IPostSupervisorPayload,
} from "../../utils/interfaces/Supervisor";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { SupervisorPayloadValidator } from "../../validator/supervisors/SupervisorValidator";
import { CaseTypes } from "../../models/CaseTypes";
import { SkillTypes } from "../../models/SkillTypes";
import { WeeklyAssesmentService } from "../../services/database/WeeklyAssesmentService";
import { DailyActivityService } from "../../services/database/DailyActivityService";

export class SupervisorHandler {
  private supervisorValidator: SupervisorPayloadValidator;
  private userSupervisorRegistrationService: UserSupervisorRegistrationService;
  private supervisorBadgeService: SupervisorBadgeService;
  private userService: UserService;
  private studentService: StudentService;
  private competencyService: CompetencyService;
  private assesmentService: AssesmentService;
    private caseTypeService: CaseTypes;
  private skillTypeService: SkillTypes;
  weeklyAssesmentService: WeeklyAssesmentService;
  dailyActivityService: DailyActivityService;

  constructor() {
    this.supervisorValidator = new SupervisorPayloadValidator();
    this.userSupervisorRegistrationService =
      new UserSupervisorRegistrationService();
    this.supervisorBadgeService = new SupervisorBadgeService();
    this.userService = new UserService();
    this.studentService = new StudentService();
    this.competencyService = new CompetencyService();
    this.assesmentService = new AssesmentService();
    this.caseTypeService = new CaseTypes();
    this.skillTypeService = new SkillTypes();
    this.postSupervisor = this.postSupervisor.bind(this);
    this.postBadgeToSupervisor = this.postBadgeToSupervisor.bind(this);
    this.getSupervisors = this.getSupervisors.bind(this);
    this.getSupervisorStudents = this.getSupervisorStudents.bind(this);
    this.getSupervisorStudentsStatistics =
      this.getSupervisorStudentsStatistics.bind(this);
    this.weeklyAssesmentService = new WeeklyAssesmentService();
    this.dailyActivityService = new DailyActivityService();

    
  }

  async getSupervisorStudentsStatistics(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { studentId } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    const student = await this.studentService.getStudentByStudentId(studentId);

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

    const activeUnit = await this.studentService.getActiveUnit(
        studentId ?? ""
      );

     const caseTypes = await this.caseTypeService.getCaseTypesByUnitId(
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );
       const skillTypes = await this.skillTypeService.getSkillTypesByUnitId(
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

    const cases =
      await this.competencyService.getCasesByStudentAndUnitIdBySupervisor(
        student.id,
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

    const skills =
      await this.competencyService.getSkillsByStudentAndUnitIdBySupervisor(
        student.id,
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

    const assesments =
      await this.assesmentService.getAssesmentsByStudentIdAndUnitId(
        student?.studentId ?? "",
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );
    
    const weeklyAssesment =
        await this.weeklyAssesmentService.getWeeklyAssesmentByStudentIdAndUnitId(
          student?.studentId ?? "",
          activeUnit?.activeUnit.activeUnit?.id ?? ""
        );

     const dailyActivities =
        await this.dailyActivityService.getDailyActivitiesByStudentNimAndUnitId(
          student?.id ?? "",
          activeUnit?.activeUnit.activeUnit?.id ?? ""
        );

      const miniCex = await this.assesmentService.getMiniCexsByUnitId(
        tokenPayload,
        activeUnit?.activeUnit.activeUnit?.id ?? ""
      );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }
    
     // * grade will be zero if no minicexgrade
      let miniCexGrade = 0;
      if (miniCex.MiniCex?.MiniCexGrade) {
        miniCex.MiniCex?.MiniCexGrade.forEach((g) => {
          miniCexGrade += g.score ?? 0;
        });
        miniCexGrade = miniCexGrade / miniCex.MiniCex?.MiniCexGrade.length;
      }

      const scientificAssesment =
        await this.assesmentService.getScientificAssesmentByUnitId(
          tokenPayload,
          activeUnit?.activeUnit.activeUnit?.id ?? ""
        );

      if (scientificAssesment && "error" in scientificAssesment) {
        switch (scientificAssesment.error) {
          case 400:
            throw new BadRequestError(scientificAssesment.message);
          case 404:
            throw new NotFoundError(scientificAssesment.message);
          default:
            throw new InternalServerError();
        }
      }

      // * grade will be zero if no scientificAssesmentgrade
      let saGrade = 0;
      if (scientificAssesment.ScientificAssesment?.grades) {
        scientificAssesment.ScientificAssesment?.grades.forEach((g) => {
          saGrade += g.score ?? 0;
        });
        saGrade =
          saGrade / scientificAssesment.ScientificAssesment?.grades.length;
      }

    let finalScore = 0;
    let osce = 0;
    let oscePercentage = 0;
    let cbt = 0;
    let cbtPercentage = 0;
    let minicexPercentage = 0;
    let saPercentage = 0;



        assesments.forEach((a) => {
        let grade = 0;
        if (a.MiniCex) {
          if (a.MiniCex.MiniCexGrade) {
            a.MiniCex.MiniCexGrade.forEach((g) => {
              grade += g.score ?? 0;
            });
            grade = grade / (a.MiniCex.MiniCexGrade.length || 1);
            grade *= a.MiniCex.weight;
            minicexPercentage = a.MiniCex.weight;
          }
        }

        if (a.ScientificAssesment) {
          if (a.ScientificAssesment?.grades) {
            a.ScientificAssesment?.grades.forEach((g) => {
              grade += g.score ?? 0;
            });
            grade = grade / a.ScientificAssesment?.grades.length;
            grade *= a.ScientificAssesment.weight;
            saPercentage = a.ScientificAssesment.weight;
          }
        }

        if (a.osce) {
          grade = a.osce.score ?? 0;
          osce = a.osce.score ?? 0;
          grade *= a.osce.weight;
          oscePercentage = a.osce.weight;
        }

        if (a.cbt) {
          cbt = a.cbt.score ?? 0;
          grade = a.cbt.score ?? 0;
          grade *= a.cbt.weight;
          cbtPercentage = a.cbt.weight;
        }
        finalScore = finalScore + grade;
      });


    return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          totalCases: caseTypes?.length ?? 0,
          totalSkills: skillTypes?.length ?? 0,
          verifiedCases: cases.filter(
            (c) => c.verificationStatus === "VERIFIED"
          ).length,
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
          student: {
            studentId: student?.studentId,
            address: student?.address,
            fullName: student?.fullName,
            clinicId: student?.clinicId,
            graduationDate: student?.graduationDate,
            phoneNumber: student?.phoneNumber,
            preClinicId: student?.preClinicId,
            checkInStatus: student?.CheckInCheckOut.at(-1)?.checkInStatus,
            checkOutStatus: student?.CheckInCheckOut.at(-1)?.checkOutStatus,
            academicSupervisorName: student?.academicAdvisor?.fullname,
            academicSupervisorId: student?.academicAdvisor?.supervisorId,
            academicSupervisorUserId: student?.academicAdvisor?.id,
            supervisingDPKName: student?.supervisingDPK?.fullname,
            supervisingDPKId: student?.supervisingDPK?.supervisorId,
            supervisingDPKUserId: student?.supervisingDPK?.id,
            examinerDPKName: student?.examinerDPK?.fullname,
            examinerDPKId: student?.examinerDPK?.supervisorId,
            examinerDPKUserId: student?.examinerDPK?.id,
            rsStation: student?.rsStation,
            pkmStation: student?.pkmStation,
            periodLengthStation: Number(student?.periodLengthStation),
          },
          weeklyAssesment: {
            studentName: weeklyAssesment[0]?.Student?.fullName,
            studentId: weeklyAssesment[0]?.Student?.studentId,
            unitName: weeklyAssesment[0]?.Unit?.name,
            assesments: weeklyAssesment.map((w) => {
              return {
                attendNum: dailyActivities
                  .filter((a) => a.day?.week?.weekNum === w.weekNum)
                  .filter((a) => a.Activity?.activityStatus === "ATTEND")
                  .length,
                notAttendNum: dailyActivities
                  .filter((a) => a.day?.week?.weekNum === w.weekNum)
                  .filter(
                    (a) =>
                      a.Activity?.activityStatus === "NOT_ATTEND" ||
                      a.Activity?.activityStatus === "SICK" ||
                      a.Activity?.activityStatus === "HOLIDAY"
                  ).length,
                score: w.score,
                verificationStatus: w.verificationStatus,
                weekNum: w.weekNum,
                id: w.id,
              };
            }),
          },
          miniCex: {
            case: miniCex.MiniCex?.case,
            id: miniCex.miniCexId,
            location: miniCex.MiniCex?.location?.name,
            studentId: miniCex.Student?.studentId,
            studentName: miniCex.Student?.fullName,
            scores: miniCex.MiniCex?.MiniCexGrade.map((g) => {
              return {
                name: g.name,
                score: g.score,
                id: g.id,
              };
            }),
            miniCexGrade,
            academicSupervisorId: miniCex.Student?.academicSupervisorId,
            examinerDPKId: miniCex.Student?.examinerSupervisorId,
            supervisingDPKId: miniCex.Student?.supervisingSupervisorId,
          },
          scientificAssesement: {
            id: scientificAssesment.scientificAssesmentId,
            studentId: scientificAssesment.Student?.studentId,
            studentName: scientificAssesment.Student?.fullName,
            case: scientificAssesment.ScientificAssesment?.title,
            location: scientificAssesment.ScientificAssesment?.location?.name,
            scores: scientificAssesment.ScientificAssesment?.grades.map((g) => {
              return {
                name: g.gradeItem.name,
                score: g.score,
                id: g.id,
                type: g.gradeItem.scientificGradeType,
              };
            }),
            saGrade,
            academicSupervisorId: miniCex.Student?.academicSupervisorId,
            examinerDPKId: miniCex.Student?.examinerSupervisorId,
            supervisingDPKId: miniCex.Student?.supervisingSupervisorId,
          },
          finalScore: {
            finalScore: finalScore,
            osce : {
              score:osce,
              percentage: oscePercentage,
            },
            cbt: {
              score:cbt,
              percentage: cbtPercentage
            },
            miniCex: {
              score: miniCexGrade,
              percentage: minicexPercentage,
            },
            sa: {
              score: saGrade,
              percentage: saPercentage,
            }
          },
        } as IStudentStastic)
      );
  }

  async getSupervisorStudents(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { ceu, page, search } = req.query;

    let students: any;

    if (!page) {
      students = await this.studentService.getStudentBySupervisorIdWithoutPage(
        tokenPayload,
        ceu
      );
    } else {
      students = await this.studentService.getStudentBySupervisorId(
        tokenPayload,
        ceu,
        parseInt(String(page ?? "1")),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        search
      );
    }

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        students.data.map((s: any) => {
          return {
            id: s.id,
            studentId: s.studentId,
            studentName: s.fullName,
            activeUnitId: s.activeUnit?.id,
            activeUnitName: s.activeUnit?.name,
            userId: s.User[0]?.id,
            pages:
              Math.ceil(
                students.count / constants.HISTORY_ELEMENTS_PER_PAGE
              ) === 0
                ? 1
                : Math.ceil(
                    students.count / constants.HISTORY_ELEMENTS_PER_PAGE
                  ),
          } as IListSupervisorStudent;
        })
      )
    );
  }

  async getSupervisors(req: Request, res: Response, next: NextFunction) {
    const supervisors = await this.userService.getUserByRole(
      constants.SUPERVISOR_ROLE
    );
    const dpks = await this.userService.getUserByRole(constants.DPK_ROLE);

    const results = [...supervisors, ...dpks];

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        results.map((s) => {
          return {
            userId: s.id,
            fullName: s.supervisor?.fullname,
            id: s.supervisor?.id,
            supervisorId: s.supervisor?.supervisorId,
          } as ISupervisorProfileDTO;
        })
      )
    );
  }

  async postBadgeToSupervisor(req: Request, res: Response, next: NextFunction) {
    const payload: IPostSupervisorBadgePayload = req.body;

    try {
      const validationResult =
        this.supervisorValidator.validatePostSupervisorBadgePayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const testError =
        await this.supervisorBadgeService.assignBadgeToSupervisor(payload);

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
            "successfully assign badge to supervisor with id " +
              payload.supervisorId
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postSupervisor(req: Request, res: Response, next: NextFunction) {
    const payload: IPostSupervisorPayload = req.body;

    try {
      const validationResult =
        this.supervisorValidator.validatePostPayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const testError =
        await this.userSupervisorRegistrationService.registerNewSupervisor(
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
            "successfully register a new supervisor with id"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
