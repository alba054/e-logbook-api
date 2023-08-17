import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { CstService } from "../../services/database/CstService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import { ICstDetail, IStudentCst, ISubmittedCst } from "../../utils/dto/CstDTO";
import {
  IPostCST,
  IPutCstTopicVerificationStatus,
} from "../../utils/interfaces/Cst";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  CstPayloadSchema,
  CstTopicVerificationStatusSchema,
} from "../../validator/cst/CstSchema";
import { Validator } from "../../validator/Validator";

export class CstHandler {
  private validator: Validator;
  private cstService: CstService;
  private studentService: StudentService;

  constructor() {
    this.cstService = new CstService();
    this.validator = new Validator();
    this.studentService = new StudentService();

    this.getCsts = this.getCsts.bind(this);
    this.postCst = this.postCst.bind(this);
    this.getCstTopics = this.getCstTopics.bind(this);
    this.putVerificationStatusCstTopic =
      this.putVerificationStatusCstTopic.bind(this);
    this.putVerificationStatusCst = this.putVerificationStatusCst.bind(this);
  }

  async putVerificationStatusCst(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutCstTopicVerificationStatus = req.body;

    try {
      const validationResult = this.validator.validate(
        CstTopicVerificationStatusSchema,
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

      const result = await this.cstService.verifyCst(id, tokenPayload, payload);

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
            "verify Cst successfully"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async putVerificationStatusCstTopic(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { topicId } = req.params;
    const payload: IPutCstTopicVerificationStatus = req.body;

    try {
      const validationResult = this.validator.validate(
        CstTopicVerificationStatusSchema,
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

      const result = await this.cstService.verifyCstTopic(
        topicId,
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
            "verify topic successfully"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getCstTopics(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    const result = await this.cstService.getCstsBySupervisorAndStudentId(
      tokenPayload,
      studentId
    );

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

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: student.studentId,
        studentName: student.fullName,
        csts: result.map(
          (r) =>
            ({
              createdAt: r.createdAt,
              verificationStatus: r.verificationStatus,
              cstId: r.id,
              topic: r.topics.map((t) => ({
                topicName: t.topic?.map((n) => n.name),
                verificationStatus: t.verificationStatus,
                endTime: Number(t.endTime),
                notes: t.notes,
                startTime: Number(t.startTime),
                id: t.id,
              })),
            } as ICstDetail)
        ),
      } as IStudentCst)
    );
  }

  async getCsts(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const result = await this.cstService.getCstsBySupervisor(tokenPayload);

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        result.map((r) => {
          return {
            latest: r.updatedAt,
            studentId: r.Student?.studentId,
            studentName: r.Student?.fullName,
          } as ISubmittedCst;
        })
      )
    );
  }

  async postCst(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostCST = req.body;

    try {
      const result = this.validator.validate(CstPayloadSchema, payload);

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

      const testError = await this.cstService.insertNewCst(
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
            "successfully post Cst"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}