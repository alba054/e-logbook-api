import { NextFunction, Request, Response } from "express";
import { constants, createResponse } from "../../utils";
import { ManagementRoleService } from "../../services/database/ManagementRoleService";
import { IPostManagementRolePayload } from "../../utils/interfaces/ManagementRole";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ManagementRoleValidator } from "../../validator/managementRoles/ManagementRoleValidator";

export class ManagementRoleHandler {
  private managementRoleService: ManagementRoleService;
  private managementRoleValidator: ManagementRoleValidator;

  constructor() {
    this.managementRoleService = new ManagementRoleService();
    this.managementRoleValidator = new ManagementRoleValidator();

    this.getManagementRolesUnit = this.getManagementRolesUnit.bind(this);
    this.postManagementRolesUnit = this.postManagementRolesUnit.bind(this);
  }

  async postManagementRolesUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const payload: IPostManagementRolePayload = req.body;

    try {
      const validationResult =
        this.managementRoleValidator.validatePostPayload(payload);

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError =
        await this.managementRoleService.insertManagementRolesUnit(payload);

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

  async getManagementRolesUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const ManagementRoles =
      await this.managementRoleService.getManagementRoleByUnitId();

    return res
      .status(200)
      .json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, ManagementRoles)
      );
  }
}
