import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { SelfReflectionService } from "../../services/database/SelfReflectionService";
import { constants, createResponse } from "../../utils";
import { IPostSelfReflection } from "../../utils/interfaces/SelfReflection";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { SelfReflectionValidator } from "../../validator/selfReflections/SelfReflectionValidator";

export class SelfReflectionHandler {
  private selfReflectionValidator: SelfReflectionValidator;
  private selfReflectionService: SelfReflectionService;

  constructor() {
    this.selfReflectionValidator = new SelfReflectionValidator();
    this.selfReflectionService = new SelfReflectionService();

    this.postSelfReflection = this.postSelfReflection.bind(this);
  }

  async postSelfReflection(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostSelfReflection = req.body;

    try {
      const result = this.selfReflectionValidator.validatePostPayload(payload);

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
        await this.selfReflectionService.insertNewSelfReflection(
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
            "successfully post self reflection"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
