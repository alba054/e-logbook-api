import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ActivityLocationService } from "../../services/database/ActivityLocationService";
import { Validator } from "../../validator/Validator";
import { IPostActivityLocationPayload } from "../../utils/interfaces/ActivityLocation";
import { ActivityLocationPayloadSchema } from "../../validator/activityLocation/ActivityLocationSchema";

export class ActivityLocationHandler {
  private activityLocationService: ActivityLocationService;
  private validator: Validator;

  constructor() {
    this.activityLocationService = new ActivityLocationService();
    this.validator = new Validator();

    this.getActivityLocationsUnit = this.getActivityLocationsUnit.bind(this);
    this.postActivityLocationsUnit = this.postActivityLocationsUnit.bind(this);
    this.deleteActivityLocation = this.deleteActivityLocation.bind(this);
  }

  async deleteActivityLocation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;

    try {
      const result =
        await this.activityLocationService.deleteActivityLocationById(
          Number(id)
        );

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully delete activity location"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postActivityLocationsUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const payload: IPostActivityLocationPayload = req.body;

    try {
      const validationResult = this.validator.validate(
        ActivityLocationPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError =
        await this.activityLocationService.insertActivityLocationsUnit(payload);

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
            "successfully insert activity locations"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getActivityLocationsUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const ActivityLocations =
      await this.activityLocationService.getActivityLocationByUnitId();

    return res
      .status(200)
      .json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, ActivityLocations)
      );
  }
}
