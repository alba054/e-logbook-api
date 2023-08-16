import { Router } from "express";
import { AffectedPartHandler } from "./AffectedPartHandler";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";

export class AffectedPartRouter {
  private affectedPartHandler: AffectedPartHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/affected-parts";
    this.router = Router();
    this.affectedPartHandler = new AffectedPartHandler();
  }

  register() {
    // * get all affected parts based on unitId
    this.router.get(
      this.path + "/units/:unitId",
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.affectedPartHandler.getAffectedPartsUnit
    );
    // * post unit affected parts
    this.router.post(
      this.path + "/units",
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.affectedPartHandler.postAffectedPartsUnit
    );

    // * delete affected part
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.affectedPartHandler.deleteAffectedPart
      );

    return this.router;
  }
}
