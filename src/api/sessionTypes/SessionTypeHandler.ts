import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { SessionTypeService } from "../../services/database/SessionTypeService";
import { constants, createResponse } from "../../utils";
import { IPostSessionTypePayload } from "../../utils/interfaces/SessionType";
import { SessionTypePayloadSchema } from "../../validator/sessionTypes/SessionTypeSchema";
import { SessionTypeValidator } from "../../validator/sessionTypes/SessionTypeValidator";

export class SessionTypeHandler {
  private sessionTypeService: SessionTypeService;
  private sessionTypeValidator: SessionTypeValidator;

  constructor() {
    this.sessionTypeService = new SessionTypeService();
    this.sessionTypeValidator = new SessionTypeValidator();

    this.getSessionTypes = this.getSessionTypes.bind(this);
    this.postSessionType = this.postSessionType.bind(this);
    this.deleteSessionType = this.deleteSessionType.bind(this);
  }

  async deleteSessionType(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await this.sessionTypeService.deleteSessionTypeById(
        Number(id)
      );

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully delete session types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postSessionType(req: Request, res: Response, next: NextFunction) {
    const payload: IPostSessionTypePayload = req.body;

    try {
      const validationResult = this.sessionTypeValidator.validate(
        SessionTypePayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.sessionTypeService.insertSessionType(
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
            "successfully insert session types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getSessionTypes(req: Request, res: Response, next: NextFunction) {
    const sessionTypes = await this.sessionTypeService.getSessionTypes();

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, sessionTypes));
  }
}
