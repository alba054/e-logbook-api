import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { SglService } from "../../services/database/SglService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import { ISglDetail, IStudentSgl, ISubmittedSgl } from "../../utils/dto/SglDTO";
import {
  IPostSGL,
  IPostSGLTopic,
  IPutSGL,
  IPutSglTopicVerificationStatus,
} from "../../utils/interfaces/Sgl";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  SglEditPayloadSchema,
  SglPayloadSchema,
  SglTopicPayloadSchema,
  SglTopicVerificationStatusSchema,
} from "../../validator/sgl/SglSchema";
import { Validator } from "../../validator/Validator";

export class SglHandler {
  private validator: Validator;
  private sglService: SglService;
  private studentService: StudentService;

  constructor() {
    this.sglService = new SglService();
    this.validator = new Validator();
    this.studentService = new StudentService();

    this.getSgls = this.getSgls.bind(this);
    this.postSgl = this.postSgl.bind(this);
    this.getSglTopics = this.getSglTopics.bind(this);
    this.putVerificationStatusSglTopic =
      this.putVerificationStatusSglTopic.bind(this);
    this.putVerificationStatusSgl = this.putVerificationStatusSgl.bind(this);
    this.putTopicSgl = this.putTopicSgl.bind(this);
    this.putAllTopicsVerificationStatus =
      this.putAllTopicsVerificationStatus.bind(this);
    this.putSgl = this.putSgl.bind(this);
    this.deleteSgl = this.deleteSgl.bind(this);
  }

  async deleteSgl(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    try {
      const result = await this.sglService.deleteSglById(id, tokenPayload);

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
    } catch (e) {
      return next(e);
    }
  }

  async putSgl(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutSGL = req.body;

    try {
      const validationResult = this.validator.validate(
        SglEditPayloadSchema,
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

      const result = await this.sglService.editSglById(
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
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "verify topic successfully"
          )
        );
    } catch (e) {
      return next(e);
    }
  }

  async putAllTopicsVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutSglTopicVerificationStatus = req.body;

    try {
      const validationResult = this.validator.validate(
        SglTopicVerificationStatusSchema,
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

      const result = await this.sglService.verifyAllSglTopics(
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

  async putTopicSgl(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostSGLTopic = req.body;
    const { id } = req.params;

    try {
      const result = this.validator.validate(SglTopicPayloadSchema, payload);

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

      const testError = await this.sglService.addTopicToSgl(
        id,
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
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully put topic sgl"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async putVerificationStatusSgl(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutSglTopicVerificationStatus = req.body;

    try {
      const validationResult = this.validator.validate(
        SglTopicVerificationStatusSchema,
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

      const result = await this.sglService.verifySgl(id, tokenPayload, payload);

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
            "verify sgl successfully"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async putVerificationStatusSglTopic(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { topicId } = req.params;
    const payload: IPutSglTopicVerificationStatus = req.body;

    try {
      const validationResult = this.validator.validate(
        SglTopicVerificationStatusSchema,
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

      const result = await this.sglService.verifySglTopic(
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

  async getSglTopics(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

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

    const result = await this.sglService.getSglsBySupervisorAndStudentId(
      tokenPayload,
      studentId,
      student.unitId ?? ""
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: student.studentId,
        studentName: student.fullName,
        unitName: result[0]?.Unit?.name,
        sgls: result.map(
          (r) =>
            ({
              createdAt: r.createdAt,
              verificationStatus: r.verificationStatus,
              sglId: r.id,
              endTime: Number(r.endTime),
              startTime: Number(r.startTime),
              supervisorName: r.supervisor.fullname,
              supervisorId: r.supervisor.supervisorId,
              topic: r.topics.map((t) => ({
                topicName: t.topic.map((n) => n.name),
                topicId: t.topic[0]?.id,
                verificationStatus: t.verificationStatus,
                notes: t.notes,
                id: t.id,
              })),
            } as ISglDetail)
        ),
      } as IStudentSgl)
    );
  }

  async getSgls(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { name, nim, page } = req.query;

    let result: any;

    if (!page) {
      result = await this.sglService.getSglsBySupervisorWithoutPage(
        tokenPayload
      );
    } else {
      result = await this.sglService.getSglsBySupervisor(
        tokenPayload,
        name,
        nim,
        parseInt(String(page ?? "1")),
        constants.HISTORY_ELEMENTS_PER_PAGE
      );
    }

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        result.map((r: any) => {
          return {
            latest: r.updatedAt,
            studentId: r.Student?.studentId,
            studentName: r.Student?.fullName,
            unitName: r.Unit?.name,
          } as ISubmittedSgl;
        })
      )
    );
  }

  async postSgl(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostSGL = req.body;

    try {
      const result = this.validator.validate(SglPayloadSchema, payload);

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

      const testError = await this.sglService.insertNewSgl(
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
            "successfully post sgl"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
