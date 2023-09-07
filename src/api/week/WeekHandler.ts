import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { WeekService } from "../../services/database/WeekService";
import { constants, createResponse } from "../../utils";
import { IPostWeek } from "../../utils/interfaces/Week";
import { Validator } from "../../validator/Validator";
import { WeekPayloadSchema } from "../../validator/week/WeekSchema";

export class WeekHandler {
  private validator: Validator;
  private weekService: WeekService;

  constructor() {
    this.validator = new Validator();
    this.weekService = new WeekService();

    this.postWeek = this.postWeek.bind(this);
  }

  async postWeek(req: Request, res: Response, next: NextFunction) {
    const payload: IPostWeek = req.body;
    try {
      const validationResult = this.validator.validate(
        WeekPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.weekService.insertWeek(payload);

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
            "successfully insert new week"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
