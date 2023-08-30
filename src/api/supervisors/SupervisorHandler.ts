import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { StudentService } from "../../services/database/StudentService";
import { UserService } from "../../services/database/UserService";
import { SupervisorBadgeService } from "../../services/facade/SupervisorBadgeService";
import { UserSupervisorRegistrationService } from "../../services/facade/UserSupervisorRegistrationService";
import { constants, createResponse } from "../../utils";
import { IListSupervisorStudent } from "../../utils/dto/StudentDTO";
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

  constructor() {
    this.supervisorValidator = new SupervisorPayloadValidator();
    this.userSupervisorRegistrationService =
      new UserSupervisorRegistrationService();
    this.supervisorBadgeService = new SupervisorBadgeService();
    this.userService = new UserService();
    this.studentService = new StudentService();

    this.postSupervisor = this.postSupervisor.bind(this);
    this.postBadgeToSupervisor = this.postBadgeToSupervisor.bind(this);
    this.getSupervisors = this.getSupervisors.bind(this);
    this.getSupervisorStudents = this.getSupervisorStudents.bind(this);
  }

  async getSupervisorStudents(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { ceu } = req.query;

    const students = await this.studentService.getStudentBySupervisorId(
      tokenPayload,
      ceu
    );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        students.map((s) => {
          return {
            id: s.id,
            studentId: s.studentId,
            studentName: s.fullName,
            activeUnitId: s.activeUnit?.id,
            activeUnitName: s.activeUnit?.name,
            userId: s.User[0]?.id,
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
