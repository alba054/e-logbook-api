import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { ManagementTypeService } from "../../services/database/ManagementTypeService";
import { IPostManagementTypePayload } from "../../utils/interfaces/ManagementType";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ManagementTypeValidator } from "../../validator/managementTypes/ManagementTypeValidator";

export class ManagementTypeHandler {
  private managementTypeService: ManagementTypeService;
  private managementTypeValidator: ManagementTypeValidator;

  constructor() {
    this.managementTypeService = new ManagementTypeService();
    this.managementTypeValidator = new ManagementTypeValidator();

    this.getManagementTypesUnit = this.getManagementTypesUnit.bind(this);
    this.postManagementTypesUnit = this.postManagementTypesUnit.bind(this);
  }

  async postManagementTypesUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const payload: IPostManagementTypePayload = req.body;

    try {
      const validationResult =
        this.managementTypeValidator.validatePostPayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError =
        await this.managementTypeService.insertManagementTypesUnit(payload);

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
            "successfully insert Management types"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getManagementTypesUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { unitId } = req.params;

    const ManagementTypes =
      await this.managementTypeService.getManagementTypeByUnitId(unitId);

    return res
      .status(200)
      .json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, ManagementTypes)
      );
  }
}
