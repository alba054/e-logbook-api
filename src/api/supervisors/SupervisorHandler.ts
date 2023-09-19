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

export class SupervisorHandler {
  private supervisorValidator: SupervisorPayloadValidator;
  private userSupervisorRegistrationService: UserSupervisorRegistrationService;
  private supervisorBadgeService: SupervisorBadgeService;
  private userService: UserService;
  private studentService: StudentService;
  private competencyService: CompetencyService;
  private assesmentService: AssesmentService;

  constructor() {
    this.supervisorValidator = new SupervisorPayloadValidator();
    this.userSupervisorRegistrationService =
      new UserSupervisorRegistrationService();
    this.supervisorBadgeService = new SupervisorBadgeService();
    this.userService = new UserService();
    this.studentService = new StudentService();
    this.competencyService = new CompetencyService();
    this.assesmentService = new AssesmentService();

    this.postSupervisor = this.postSupervisor.bind(this);
    this.postBadgeToSupervisor = this.postBadgeToSupervisor.bind(this);
    this.getSupervisors = this.getSupervisors.bind(this);
    this.getSupervisorStudents = this.getSupervisorStudents.bind(this);
    this.getSupervisorStudentsStatistics =
      this.getSupervisorStudentsStatistics.bind(this);
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

    const activeUnit = await this.studentService.getActiveUnit(student.id);

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

  async getSupervisorStudents(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { ceu, page, search } = req.query;

    const students = await this.studentService.getStudentBySupervisorId(
      tokenPayload,
      ceu,
      parseInt(String(page ?? "1")),
      constants.HISTORY_ELEMENTS_PER_PAGE,
      search
    );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        students.data.map((s) => {
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
