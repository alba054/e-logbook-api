import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { ScientificSessionService } from "../../services/database/ScientificSessionService";
import { constants, createResponse } from "../../utils";
import { IPostScientificSessionPayload } from "../../utils/interfaces/ScientificSession";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { ScientificSessionValidator } from "../../validator/scientificSessions/ScientificSessionValidator";

export class ScientificSessionHandler {
  private scientificSessionValidator: ScientificSessionValidator;
  private scientificSessionService: ScientificSessionService;

  constructor() {
    this.scientificSessionValidator = new ScientificSessionValidator();
    this.scientificSessionService = new ScientificSessionService();

    this.postScientificSession = this.postScientificSession.bind(this);
  }

  async postScientificSession(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostScientificSessionPayload = req.body;

    try {
      const result =
        this.scientificSessionValidator.validatePostPayload(payload);

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

      const testError =
        await this.scientificSessionService.insertNewScientificSession(
          tokenPayload,
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
            "successfully post scientific session"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
