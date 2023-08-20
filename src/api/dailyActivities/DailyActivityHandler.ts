import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { DailyActivityService } from "../../services/database/DailyActivityService";
import { constants, createResponse } from "../../utils";
import { IPutDailyActivityActivity } from "../../utils/interfaces/DailyActivity";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { DailyActivityActivityPayloadSchema } from "../../validator/dailyActivities/DailyActivitySchema";
import { Validator } from "../../validator/Validator";

export class DailyActivityHandler {
  private dailyActivityService: DailyActivityService;
  private validator: Validator;

  constructor() {
    this.dailyActivityService = new DailyActivityService();
    this.validator = new Validator();

    this.putDailyActivityActivity = this.putDailyActivityActivity.bind(this);
  }

  async putDailyActivityActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutDailyActivityActivity = req.body;

    try {
      const validationResult = this.validator.validate(
        DailyActivityActivityPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const result = await this.dailyActivityService.editDailyActivityActivity(
        tokenPayload,
        id,
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
            "successfully fill daily activity"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
