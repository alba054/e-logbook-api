import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { ScientificRoleService } from "../../services/database/ScientificRoleService";
import { constants, createResponse } from "../../utils";
import { IPostScientificRolePayload } from "../../utils/interfaces/ScientificRole";
import { ScientificRolePayloadSchema } from "../../validator/scientificRole/ScientificRoleSchema";
import { ScientificRoleValidator } from "../../validator/scientificRole/ScientificRoleValidator";

export class ScientificRoleHandler {
  private scientificRoleService: ScientificRoleService;
  private scientificRoleValidator: ScientificRoleValidator;

  constructor() {
    this.scientificRoleService = new ScientificRoleService();
    this.scientificRoleValidator = new ScientificRoleValidator();

    this.getScientificRoles = this.getScientificRoles.bind(this);
    this.postScientificRole = this.postScientificRole.bind(this);
  }

  async postScientificRole(req: Request, res: Response, next: NextFunction) {
    const payload: IPostScientificRolePayload = req.body;

    try {
      const validationResult = this.scientificRoleValidator.validate(
        ScientificRolePayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.scientificRoleService.insertScientificRole(
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
            "successfully insert scientific roles"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getScientificRoles(req: Request, res: Response, next: NextFunction) {
    const scientificRoles =
      await this.scientificRoleService.getScientificRoles();

    return res
      .status(200)
      .json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, scientificRoles)
      );
  }
}
