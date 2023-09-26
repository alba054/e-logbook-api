import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { WeekService } from "../../services/database/WeekService";
import { constants, createErrorObject, createResponse } from "../../utils";
import { IListWeek } from "../../utils/dto/WeekDTO";
import { IPostWeek, IPutWeek } from "../../utils/interfaces/Week";
import { Validator } from "../../validator/Validator";
import {
  WeekEditPayloadSchema,
  WeekPayloadSchema,
} from "../../validator/week/WeekSchema";

export class WeekHandler {
  private validator: Validator;
  private weekService: WeekService;

  constructor() {
    this.validator = new Validator();
    this.weekService = new WeekService();

    this.postWeek = this.postWeek.bind(this);
    this.getWeeks = this.getWeeks.bind(this);
    this.putWeekStatus = this.putWeekStatus.bind(this);
    this.putWeek = this.putWeek.bind(this);
    this.deleteWeek = this.deleteWeek.bind(this);
  }
  async putWeekStatus(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const { status } = req.body;

    try {
      if (!status) {
        return createErrorObject(
          400,
          "status must be provided (true or false)"
        );
      }

      const testError = await this.weekService.updateWeekStatus(
        id,
        Boolean(status)
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
            "successfully insert new week"
          )
        );
    } catch (error) {
      return next(error);
    }
    this.putWeek = this.putWeek.bind(this);
    this.deleteWeek = this.deleteWeek.bind(this);
  }

  async deleteWeek(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const testError = await this.weekService.deleteWeek(id);

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
        .status(200)
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

  async putWeek(req: Request, res: Response, next: NextFunction) {
    const payload: IPutWeek = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.validator.validate(
        WeekEditPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.weekService.editWeek(id, payload);

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
        .status(200)
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
            status: w.status,
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
