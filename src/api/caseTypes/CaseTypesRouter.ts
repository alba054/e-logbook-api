import { Router } from "express";
import { CaseTypesHandler } from "./CaseTypesHandler";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";

export class CaseTypesRouter {
  private caseTypesHandler: CaseTypesHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/case-types";
    this.router = Router();
    this.caseTypesHandler = new CaseTypesHandler();
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
      this.caseTypesHandler.getCaseTypesUnit
    );
    // * post unit affected parts
    this.router.post(
      this.path + "/units",
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.caseTypesHandler.postCaseTypesUnit
    );

    // * delete affected part
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.caseTypesHandler.deleteCaseTypes
      );

    return this.router;
  }
}
