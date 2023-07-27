import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { ScientificRoleHandler } from "./ScientificRoleHandler";

export class ScientificRoleRouter {
  private scientificRoleHandler: ScientificRoleHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/scientific-roles";
    this.router = Router();
    this.scientificRoleHandler = new ScientificRoleHandler();
  }

  register() {
    // * get all session types
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.scientificRoleHandler.getScientificRoles
    );
    // * post session type
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.scientificRoleHandler.postScientificRole
    );

    return this.router;
  }
}
