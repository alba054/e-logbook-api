import { NotFoundError } from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { AssesmentService } from "../../services/database/AssesmentService";
import { constants, createResponse } from "../../utils";
import { IListMiniCex } from "../../utils/dto/AssesmentDTO";
import { IPostMiniCex } from "../../utils/interfaces/Assesment";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { MiniCexPayloadSchema } from "../../validator/assesment/AssesmentSchema";
import { Validator } from "../../validator/Validator";

export class AssesmentHandler {
  private assesmentService: AssesmentService;
  private validator: Validator;

  constructor() {
    this.assesmentService = new AssesmentService();
    this.validator = new Validator();

    this.getAssesmentMiniCexs = this.getAssesmentMiniCexs.bind(this);
    this.postAssesmentMiniCex = this.postAssesmentMiniCex.bind(this);
    this.getScientificAssesments = this.getScientificAssesments.bind(this);
  }

  async getScientificAssesments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { studentId } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    const scientificAssesment =
      await this.assesmentService.getScientificAssesmentByStudentId(
        tokenPayload,
        studentId
      );

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE));
  }

  async postAssesmentMiniCex(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostMiniCex = req.body;

    try {
      const validationResult = this.validator.validate(
        MiniCexPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const result = await this.assesmentService.addMiniCexAssesment(
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
        .status(201)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully post assesment mini cex"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getAssesmentMiniCexs(req: Request, res: Response, next: NextFunction) {
    const { studentId } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    const miniCexs = await this.assesmentService.getMiniCexsByStudentId(
      tokenPayload,
      studentId
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        case: miniCexs?.MiniCex?.case,
        location: miniCexs?.MiniCex?.location?.name,
        studentId: miniCexs?.Student?.studentId,
      } as IListMiniCex)
    );
  }
}
