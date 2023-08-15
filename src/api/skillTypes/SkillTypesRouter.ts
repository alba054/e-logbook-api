import { Router } from "express";
import { SkillTypesHandler } from "./SkillTypesHandler";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";

export class SkillTypesRouter {
  private skillTypesHandler: SkillTypesHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/skill-types";
    this.router = Router();
    this.skillTypesHandler = new SkillTypesHandler();
  }

  register() {
    // * get all skill types based on unitId
    this.router.get(
      this.path + "/units/:unitId",
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.skillTypesHandler.getSkillTypesUnit
    );
    // * post unit skill types
    this.router.post(
      this.path + "/units",
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.skillTypesHandler.postSkillTypesUnit
    );

    // * delete skill type
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.skillTypesHandler.deleteSkillTypes
      );

    return this.router;
  }
}
