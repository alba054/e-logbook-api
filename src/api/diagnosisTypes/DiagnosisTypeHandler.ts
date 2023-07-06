import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { DiagnosisTypeService } from "../../services/database/DiagnosisTypeService";
import { IPostDiagnosisTypePayload } from "../../utils/interfaces/DiagnosisType";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { DiagnosisTypeValidator } from "../../validator/diagnosisTypes/DiagnosisTypeValidator";

export class DiagnosisTypeHandler {
  private diagnosisTypeService: DiagnosisTypeService;
  private diagnosisTypeValidator: DiagnosisTypeValidator;

  constructor() {
    this.diagnosisTypeService = new DiagnosisTypeService();
    this.diagnosisTypeValidator = new DiagnosisTypeValidator();

    this.getDiagnosisTypesUnit = this.getDiagnosisTypesUnit.bind(this);
    this.postDiagnosisTypesUnit = this.postDiagnosisTypesUnit.bind(this);
  }

  async postDiagnosisTypesUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const payload: IPostDiagnosisTypePayload = req.body;

    try {
      const validationResult =
        this.diagnosisTypeValidator.validatePostPayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError =
        await this.diagnosisTypeService.insertDiagnosisTypesUnit(payload);

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
            "successfully insert diagnosis types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getDiagnosisTypesUnit(req: Request, res: Response, next: NextFunction) {
    const { unitId } = req.params;

    const diagnosisTypes =
      await this.diagnosisTypeService.getDiagnosisTypeByUnitId(unitId);

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, diagnosisTypes));
  }
}
