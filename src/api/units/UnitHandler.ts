import { Request, Response, NextFunction } from "express";
import { constants, createResponse } from "../../utils";
import { UnitService } from "../../services/database/UnitService";
import { IPostUnit } from "../../utils/interfaces/Unit";
import { UnitPayloadValidator } from "../../validator/units/UnitValidator";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";

export class UnitHandler {
  private unitService: UnitService;
  private unitValidator: UnitPayloadValidator;

  constructor() {
    this.unitService = new UnitService();
    this.unitValidator = new UnitPayloadValidator();

    this.getAllUnits = this.getAllUnits.bind(this);
    this.postUnit = this.postUnit.bind(this);
  }

  async postUnit(req: Request, res: Response, next: NextFunction) {
    const payload: IPostUnit = req.body;
    try {
      const validationResult = this.unitValidator.validatePostPayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.unitService.insertNewUnit(payload);

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
            "successfully insert new unit"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getAllUnits(req: Request, res: Response, next: NextFunction) {
    const units = await this.unitService.getAllUnits();

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, units));
  }
}
