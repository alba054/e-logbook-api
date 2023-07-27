import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { SelfReflectionService } from "../../services/database/SelfReflectionService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import {
  IStudentSelfReflections,
  ISubmittedSelfReflections,
} from "../../utils/dto/SelfReflectionDTO";
import {
  IPostSelfReflection,
  IPutSelfReflectionVerificationStatus,
} from "../../utils/interfaces/SelfReflection";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { SelfReflectionVerificationStatusSchema } from "../../validator/selfReflections/SelfReflectionSchema";
import { SelfReflectionValidator } from "../../validator/selfReflections/SelfReflectionValidator";

export class SelfReflectionHandler {
  private selfReflectionValidator: SelfReflectionValidator;
  private selfReflectionService: SelfReflectionService;
  private studentService: StudentService;

  constructor() {
    this.selfReflectionValidator = new SelfReflectionValidator();
    this.selfReflectionService = new SelfReflectionService();
    this.studentService = new StudentService();

    this.postSelfReflection = this.postSelfReflection.bind(this);
    this.getSubmittedSelfReflections =
      this.getSubmittedSelfReflections.bind(this);
    this.getStudentSelfReflections = this.getStudentSelfReflections.bind(this);
    this.putSelfReflectionVerificationStatus =
      this.putSelfReflectionVerificationStatus.bind(this);
  }

  async putSelfReflectionVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutSelfReflectionVerificationStatus = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.selfReflectionValidator.validate(
        SelfReflectionVerificationStatusSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        switch (validationResult.error) {
          case 400:
            throw new BadRequestError(validationResult.message);
          case 404:
            throw new NotFoundError(validationResult.message);
          default:
            throw new InternalServerError();
        }
      }

      const result = await this.selfReflectionService.verifySelfReflection(
        id,
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
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, result));
    } catch (error) {
      return next(error);
    }
  }

  async getStudentSelfReflections(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    const selfReflections =
      await this.selfReflectionService.getSelfReflectionsByStudentId(
        tokenPayload,
        studentId
      );

    const student = await this.studentService.getStudentByStudentId(studentId);

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentName: student?.fullName,
        studentId: studentId,
        listSelfReflections: selfReflections.map((s) => {
          return {
            content: s.content,
            selfReflectionId: s.id,
            verificationStatus: s.verificationStatus,
          };
        }),
      } as IStudentSelfReflections)
    );
  }

  async getSubmittedSelfReflections(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const selfReflections =
      await this.selfReflectionService.getSelfReflectionsBySupervisor(
        tokenPayload
      );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        selfReflections.map((s) => {
          return {
            latest: s.createdAt,
            studentId: s.Student?.studentId,
            studentName: s.Student?.fullName,
          } as ISubmittedSelfReflections;
        })
      )
    );
  }

  async postSelfReflection(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostSelfReflection = req.body;

    try {
      const result = this.selfReflectionValidator.validatePostPayload(payload);

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

      const testError =
        await this.selfReflectionService.insertNewSelfReflection(
          tokenPayload,
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
            "successfully post self reflection"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
