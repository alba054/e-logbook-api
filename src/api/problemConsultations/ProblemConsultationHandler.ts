import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { ProblemConsultationService } from "../../services/database/ProblemConsultationService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import {
  IProblemConsultationDetailDTO,
  IStudentProblemConsultations,
  ISubmittedProblemConsultations,
} from "../../utils/dto/ProblemConsultationDTO";
import {
  IPostProblemConsultation,
  IPutProblemConsultation,
  IPutProblemConsultationVerificationStatus,
} from "../../utils/interfaces/ProblemConsultation";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  ProblemConsultationPayloadSchema,
  ProblemConsultationVerificationStatusSchema,
} from "../../validator/problemConsultation/ProblemConsultationSchema";
import { Validator } from "../../validator/Validator";

export class ProblemConsultationHandler {
  private validator: Validator;
  private problemConsultationService: ProblemConsultationService;
  private studentService: StudentService;

  constructor() {
    this.validator = new Validator();
    this.problemConsultationService = new ProblemConsultationService();
    this.studentService = new StudentService();

    this.postProblemConsultation = this.postProblemConsultation.bind(this);
    this.getSubmittedProblemConsultations =
      this.getSubmittedProblemConsultations.bind(this);
    this.getStudentProblemConsultations =
      this.getStudentProblemConsultations.bind(this);
    this.putProblemConsultationVerificationStatus =
      this.putProblemConsultationVerificationStatus.bind(this);
    this.getProblemConsultationDetail =
      this.getProblemConsultationDetail.bind(this);
    this.putProblemConsultationDetail =
      this.putProblemConsultationDetail.bind(this);
  }

  async putProblemConsultationDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutProblemConsultation = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.validator.validate(
        ProblemConsultationPayloadSchema,
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

      const result =
        await this.problemConsultationService.updateProblemConsultation(
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
            "successfully update problem consultation"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getProblemConsultationDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;

    try {
      const ProblemConsultation =
        await this.problemConsultationService.getProblemConsultationById(
          tokenPayload,
          id
        );

      if (ProblemConsultation && "error" in ProblemConsultation) {
        switch (ProblemConsultation.error) {
          case 400:
            throw new BadRequestError(ProblemConsultation.message);
          case 404:
            throw new NotFoundError(ProblemConsultation.message);
          default:
            throw new InternalServerError();
        }
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          content: ProblemConsultation.problem,
          ProblemConsultationId: ProblemConsultation.id,
          studentId: ProblemConsultation.Student?.studentId,
          studentName: ProblemConsultation.Student?.fullName,
          verificationStatus: ProblemConsultation.verificationStatus,
          solution: ProblemConsultation.solution,
        } as IProblemConsultationDetailDTO)
      );
    } catch (error) {
      return next(error);
    }
  }

  async putProblemConsultationVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutProblemConsultationVerificationStatus = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.validator.validate(
        ProblemConsultationVerificationStatusSchema,
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

      const result =
        await this.problemConsultationService.verifyProblemConsultation(
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

  async getStudentProblemConsultations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    try {
      const ProblemConsultations =
        await this.problemConsultationService.getProblemConsultationsByStudentId(
          tokenPayload,
          studentId
        );

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
          studentName: student?.fullName,
          studentId: studentId,
          listProblemConsultations: ProblemConsultations.map((s) => {
            return {
              content: s.problem,
              problemConsultationId: s.id,
              verificationStatus: s.verificationStatus,
              solution: s.solution,
            };
          }),
        } as IStudentProblemConsultations)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getSubmittedProblemConsultations(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const ProblemConsultations =
      await this.problemConsultationService.getProblemConsultationsBySupervisor(
        tokenPayload
      );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        ProblemConsultations.map((p) => {
          return {
            studentName: p.Student?.fullName,
            studentId: p.Student?.studentId,
            latest: p.createdAt,
          } as ISubmittedProblemConsultations;
        })
      )
    );
  }

  async postProblemConsultation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostProblemConsultation = req.body;

    try {
      const result = this.validator.validate(
        ProblemConsultationPayloadSchema,
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

      const testError =
        await this.problemConsultationService.insertNewProblemConsultation(
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
            "successfully post problem consultation"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
