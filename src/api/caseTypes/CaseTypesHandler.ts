import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { CaseTypesService } from "../../services/database/CaseTypesService";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { Validator } from "../../validator/Validator";
import { IPostCaseTypesPayload } from "../../utils/interfaces/CaseTypes";
import { CaseTypesPayloadSchema } from "../../validator/caseTypes/CaseTypesSchema";

export class CaseTypesHandler {
  private caseTypesService: CaseTypesService;
  private validator: Validator;

  constructor() {
    this.caseTypesService = new CaseTypesService();
    this.validator = new Validator();

    this.getCaseTypesUnit = this.getCaseTypesUnit.bind(this);
    this.postCaseTypesUnit = this.postCaseTypesUnit.bind(this);
    this.deleteCaseTypes = this.deleteCaseTypes.bind(this);
  }

  async deleteCaseTypes(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await this.caseTypesService.deleteCaseTypesById(
        Number(id)
      );

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully delete case types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postCaseTypesUnit(req: Request, res: Response, next: NextFunction) {
    const payload: IPostCaseTypesPayload = req.body;

    try {
      const validationResult = this.validator.validate(
        CaseTypesPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.caseTypesService.insertCaseTypesUnit(
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
            "successfully insert case types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getCaseTypesUnit(req: Request, res: Response, next: NextFunction) {
    const { unitId } = req.params;

    const CaseTypes = await this.caseTypesService.getCaseTypesByUnitId(unitId);

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, CaseTypes));
  }
}
