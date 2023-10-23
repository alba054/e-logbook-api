import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { CstService } from "../../services/database/CstService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import {
  ICstDetail,
  ICstHistoryDetail,
  IStudentCst,
  ISubmittedCst,
} from "../../utils/dto/CstDTO";
import {
  IPostCST,
  IPostCSTTopic,
  IPutCST,
  IPutCstTopicVerificationStatus,
} from "../../utils/interfaces/Cst";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  CstEditPayloadSchema,
  CstPayloadSchema,
  CstTopicPayloadSchema,
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

    this.getCst = this.getCst.bind(this);
    this.getCsts = this.getCsts.bind(this);
    this.postCst = this.postCst.bind(this);
    this.getCstTopics = this.getCstTopics.bind(this);
    this.putVerificationStatusCstTopic =
      this.putVerificationStatusCstTopic.bind(this);
    this.putVerificationStatusCst = this.putVerificationStatusCst.bind(this);
    this.putTopicCst = this.putTopicCst.bind(this);
    this.putAllTopicsVerificationStatus =
      this.putAllTopicsVerificationStatus.bind(this);
    this.deleteCst = this.deleteCst.bind(this);
    this.putCst = this.putCst.bind(this);
  }

  async getCst(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;

    const result = await this.cstService.getCstById(id, tokenPayload);

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
        cstId: result.id,
        studentId: result.Student?.studentId,
        studentName: result.Student?.fullName,
        supervisorId: result.supervisor?.supervisorId,
        supervisorName: result.supervisor?.fullname,
        unitName: result.Unit?.name,
        createdAt: result.createdAt,
        startTime: Number(result.startTime),
        endTime: Number(result.endTime),
        topic: result.topics.map((t) => ({
          topicName: t.topic.map((n) => n.name),
          topicId: t.topic[0]?.id,
          verificationStatus: t.verificationStatus,
          notes: t.notes,
          id: t.id,
        })),
      } as ICstHistoryDetail)
    );
  }

  async deleteCst(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    try {
      const result = await this.cstService.deleteSglById(id, tokenPayload);

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

  async putCst(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutCST = req.body;

    try {
      const validationResult = this.validator.validate(
        CstEditPayloadSchema,
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

      const result = await this.cstService.editCstById(
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

      const result = await this.cstService.verifyAllCstTopics(
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

  async putTopicCst(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostCSTTopic = req.body;
    const { id } = req.params;

    try {
      const result = this.validator.validate(CstTopicPayloadSchema, payload);

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

      const testError = await this.cstService.addTopicToCst(
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
            "successfully put topic cst"
          )
        );
    } catch (error) {
      return next(error);
    }
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

    const result = await this.cstService.getCstsBySupervisorAndStudentId(
      tokenPayload,
      studentId,
      student.unitId ?? ""
    );
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
              endTime: Number(r.endTime),
              startTime: Number(r.startTime),
              supervisorId: r.supervisor.supervisorId,
              supervisorName: r.supervisor.fullname,
              topic: r.topics.map((t) => ({
                topicName: t.topic?.map((n) => n.name),
                topicId: t.topic[0]?.id,
                verificationStatus: t.verificationStatus,
                notes: t.notes,
                id: t.id,
              })),
            } as ICstDetail)
        ),
      } as IStudentCst)
    );
  }

  async getCsts(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { name, nim, page, unit } = req.query;

    let result: any;

    if (!page) {
      result = await this.cstService.getCstsBySupervisorWithoutPage(
        tokenPayload,
        String(unit)
      );
    } else {
      result = await this.cstService.getCstsBySupervisor(
        tokenPayload,
        name,
        nim,
        parseInt(String(page ?? "1")),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        String(unit)
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
