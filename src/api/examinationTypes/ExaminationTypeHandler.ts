import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { ExaminationTypeService } from "../../services/database/ExaminationTypeService";
import { IPostExaminationTypePayload } from "../../utils/interfaces/ExaminationType";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ExaminationTypeValidator } from "../../validator/examinationTypes/ExaminationTypeValidator";

export class ExaminationTypeHandler {
  private examinationTypeService: ExaminationTypeService;
  private examinationTypeValidator: ExaminationTypeValidator;

  constructor() {
    this.examinationTypeService = new ExaminationTypeService();
    this.examinationTypeValidator = new ExaminationTypeValidator();

    this.getExaminationTypesUnit = this.getExaminationTypesUnit.bind(this);
    this.postExaminationTypesUnit = this.postExaminationTypesUnit.bind(this);
  }

  async postExaminationTypesUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const payload: IPostExaminationTypePayload = req.body;

    try {
      const validationResult =
        this.examinationTypeValidator.validatePostPayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError =
        await this.examinationTypeService.insertExaminationTypesUnit(payload);

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
            "successfully insert examination types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getExaminationTypesUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { unitId } = req.params;

    const examinationTypes =
      await this.examinationTypeService.getExaminationTypeByUnitId(unitId);

    return res
      .status(200)
      .json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, examinationTypes)
      );
  }
}
