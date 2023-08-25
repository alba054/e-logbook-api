import { NotFoundError } from "@prisma/client/runtime/library";
import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { AssesmentService } from "../../services/database/AssesmentService";
import { constants, createResponse } from "../../utils";
import {
  IListMiniCex,
  IListScientificAssesment,
  IMiniCexDetail,
} from "../../utils/dto/AssesmentDTO";
import {
  IPostMiniCex,
  IPutGradeItemMiniCex,
  IPutGradeItemMiniCexScore,
} from "../../utils/interfaces/Assesment";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  GradeItemMiniCexSchema,
  GradeItemMiniCexScoreSchema,
  MiniCexPayloadSchema,
} from "../../validator/assesment/AssesmentSchema";
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
    this.getMiniCexDetail = this.getMiniCexDetail.bind(this);
    this.putMiniCexGradeItem = this.putMiniCexGradeItem.bind(this);
    this.putMiniCexGradeItemScore = this.putMiniCexGradeItemScore.bind(this);
    this.getScientificAssesmentDetail =
      this.getScientificAssesmentDetail.bind(this);
    this.putScientificAssesmentGradeItemScore =
      this.putScientificAssesmentGradeItemScore.bind(this);
  }

  async putScientificAssesmentGradeItemScore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutGradeItemMiniCexScore = req.body;

    try {
      const validationResult = this.validator.validate(
        GradeItemMiniCexScoreSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const miniCex = await this.assesmentService.scoreScientificAssesment(
        tokenPayload,
        id,
        payload
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

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, miniCex));
    } catch (error) {
      return next(error);
    }
  }

  async getScientificAssesmentDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    try {
      const miniCex = await this.assesmentService.getScientificAssesmentById(
        tokenPayload,
        id
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
      let grade = 0;
      if (miniCex.ScientificAssesment?.grades) {
        miniCex.ScientificAssesment?.grades.forEach((g) => {
          grade += g.score;
        });
        grade = grade / miniCex.ScientificAssesment?.grades.length;
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          id: miniCex.miniCexId,
          studentId: miniCex.Student?.studentId,
          studentName: miniCex.Student?.fullName,
          scores: miniCex.ScientificAssesment?.grades.map((g) => {
            return {
              name: g.gradeItem.name,
              score: g.score,
              id: g.id,
            };
          }),
          grade,
        } as IMiniCexDetail)
      );
    } catch (error) {
      return next(error);
    }
  }

  async putMiniCexGradeItemScore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutGradeItemMiniCexScore = req.body;

    try {
      const validationResult = this.validator.validate(
        GradeItemMiniCexScoreSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const miniCex = await this.assesmentService.scoreMiniCex(
        tokenPayload,
        id,
        payload
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

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, miniCex));
    } catch (error) {
      return next(error);
    }
  }

  async putMiniCexGradeItem(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutGradeItemMiniCex = req.body;

    try {
      const validationResult = this.validator.validate(
        GradeItemMiniCexSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const miniCex = await this.assesmentService.addGradeItemToMiniCex(
        tokenPayload,
        id,
        payload
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

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, miniCex));
    } catch (error) {
      return next(error);
    }
  }

  async getMiniCexDetail(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    try {
      const miniCex = await this.assesmentService.getMiniCexsById(
        tokenPayload,
        id
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
      let grade = 0;
      if (miniCex.MiniCex?.MiniCexGrade) {
        miniCex.MiniCex?.MiniCexGrade.forEach((g) => {
          grade += g.score;
        });
        grade = grade / miniCex.MiniCex?.MiniCexGrade.length;
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
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
          grade,
        } as IMiniCexDetail)
      );
    } catch (error) {
      return next(error);
    }
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

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        id: scientificAssesment?.scientificAssesmentId,
        studentId: scientificAssesment?.Student?.studentId,
        studentName: scientificAssesment?.Student?.fullName,
      } as IListScientificAssesment)
    );
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
        id: miniCexs?.MiniCex?.id,
        studentName: miniCexs?.Student?.fullName,
      } as IListMiniCex)
    );
  }
}
