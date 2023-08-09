import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { AffectedPartService } from "../../services/database/AfffectedPartService";
import { IPostAffectedPartPayload } from "../../utils/interfaces/AffectedPart";
import { AffectedPartValidator } from "../../validator/affectedParts/AffectedPartValidator";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";

export class AffectedPartHandler {
  private affectedPartService: AffectedPartService;
  private affectePartValidator: AffectedPartValidator;

  constructor() {
    this.affectedPartService = new AffectedPartService();
    this.affectePartValidator = new AffectedPartValidator();

    this.getAffectedPartsUnit = this.getAffectedPartsUnit.bind(this);
    this.postAffectedPartsUnit = this.postAffectedPartsUnit.bind(this);
    this.deleteAffectedPart = this.deleteAffectedPart.bind(this);
  }

  async deleteAffectedPart(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await this.affectedPartService.deleteAffectedPartById(id);

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully delete affected part"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postAffectedPartsUnit(req: Request, res: Response, next: NextFunction) {
    const payload: IPostAffectedPartPayload = req.body;

    try {
      const validationResult =
        this.affectePartValidator.validatePostPayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.affectedPartService.insertAffectedPartsUnit(
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
            "successfully insert affected parts"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getAffectedPartsUnit(req: Request, res: Response, next: NextFunction) {
    const { unitId } = req.params;

    const affectedParts =
      await this.affectedPartService.getAffectedPartsByUnitId(unitId);

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, affectedParts));
  }
}
