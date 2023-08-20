import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { Validator } from "../../validator/Validator";
import { ActivityNameService } from "../../services/database/ActivityNameService";
import { IPostActivityNamePayload } from "../../utils/interfaces/ActivityName";
import { ActivityNamePayloadSchema } from "../../validator/activityName/ActivityNameSchema";

export class ActivityNameHandler {
  private activityNameService: ActivityNameService;
  private validator: Validator;

  constructor() {
    this.activityNameService = new ActivityNameService();
    this.validator = new Validator();

    this.getActivityNamesUnit = this.getActivityNamesUnit.bind(this);
    this.postActivityNamesUnit = this.postActivityNamesUnit.bind(this);
    this.deleteActivityName = this.deleteActivityName.bind(this);
  }

  async deleteActivityName(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await this.activityNameService.deleteActivityNameById(
        Number(id)
      );

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully delete activity name"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postActivityNamesUnit(req: Request, res: Response, next: NextFunction) {
    const payload: IPostActivityNamePayload = req.body;

    try {
      const validationResult = this.validator.validate(
        ActivityNamePayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.activityNameService.insertActivityNamesUnit(
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
            "successfully insert activity names"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getActivityNamesUnit(req: Request, res: Response, next: NextFunction) {
    const ActivityNames =
      await this.activityNameService.getActivityNameByUnitId();

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, ActivityNames));
  }
}
