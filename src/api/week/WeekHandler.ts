import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { WeekService } from "../../services/database/WeekService";
import { constants, createResponse } from "../../utils";
import { IListWeek } from "../../utils/dto/WeekDTO";
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
    this.getWeeks = this.getWeeks.bind(this);
  }

  async getWeeks(req: Request, res: Response, next: NextFunction) {
    const { unitId } = req.query;

    let weeks;
    if (unitId) {
      weeks = await this.weekService.getWeeksByUnitId(String(unitId));
    } else {
      weeks = await this.weekService.getWeeks();
    }

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        weeks.map((w) => {
          return {
            days: w.Day.map((d) => {
              return {
                day: d.day,
                id: d.id,
              };
            }),
            endDate: Number(w.endDate),
            id: w.id,
            startDate: Number(w.startDate),
            unitId: w.unitId,
            weekName: w.weekNum,
            unitName: w.Unit?.name,
          } as IListWeek;
        })
      )
    );
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
