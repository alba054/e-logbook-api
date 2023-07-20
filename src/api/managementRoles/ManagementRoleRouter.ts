import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { ManagementRoleHandler } from "./ManagementRoleHandler";

export class ManagementRoleRouter {
  private managementRoleHandler: ManagementRoleHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/management-roles";
    this.router = Router();
    this.managementRoleHandler = new ManagementRoleHandler();
  }

  register() {
    // * get all Management roles based on unitId
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.managementRoleHandler.getManagementRolesUnit
    );
    // * post unit Management roles
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.managementRoleHandler.postManagementRolesUnit
    );

    return this.router;
  }
}
