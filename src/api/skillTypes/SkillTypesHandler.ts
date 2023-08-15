import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { SkillTypesService } from "../../services/database/SkillTypesService";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { IPostSkillTypesPayload } from "../../utils/interfaces/SkillTypes";
import { Validator } from "../../validator/Validator";
import { SkillTypesPayloadSchema } from "../../validator/skillTypes/SkillTypesSchema";

export class SkillTypesHandler {
  private skillTypesService: SkillTypesService;
  private validator: Validator;

  constructor() {
    this.skillTypesService = new SkillTypesService();
    this.validator = new Validator();

    this.getSkillTypesUnit = this.getSkillTypesUnit.bind(this);
    this.postSkillTypesUnit = this.postSkillTypesUnit.bind(this);
    this.deleteSkillTypes = this.deleteSkillTypes.bind(this);
  }

  async deleteSkillTypes(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await this.skillTypesService.deleteSkillTypesById(
        Number(id)
      );

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully delete skill types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postSkillTypesUnit(req: Request, res: Response, next: NextFunction) {
    const payload: IPostSkillTypesPayload = req.body;

    try {
      const validationResult = this.validator.validate(
        SkillTypesPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.skillTypesService.insertSkillTypesUnit(
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
            "successfully insert skill types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getSkillTypesUnit(req: Request, res: Response, next: NextFunction) {
    const { unitId } = req.params;

    const SkillTypes = await this.skillTypesService.getSkillTypesByUnitId(
      unitId
    );

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, SkillTypes));
  }
}
