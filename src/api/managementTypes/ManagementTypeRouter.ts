import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { ManagementTypeHandler } from "./ManagementTypeHandler";

export class ManagementTypeRouter {
  private managementTypeHandler: ManagementTypeHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/management-types";
    this.router = Router();
    this.managementTypeHandler = new ManagementTypeHandler();
  }

  register() {
    // * get all Management types based on unitId
    this.router.get(
      this.path + "/units/:unitId",
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.managementTypeHandler.getManagementTypesUnit
    );
    // * post unit Management types
    this.router.post(
      this.path + "/units",
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.managementTypeHandler.postManagementTypesUnit
    );

    // * delete management type
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.managementTypeHandler.deleteManagementType
      );

    return this.router;
  }
}
