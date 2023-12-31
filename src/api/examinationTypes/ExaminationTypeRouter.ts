import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { ExaminationTypeHandler } from "./ExaminationTypeHandler";

export class ExaminationTypeRouter {
  private examinationType: ExaminationTypeHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/examination-types";
    this.router = Router();
    this.examinationType = new ExaminationTypeHandler();
  }

  register() {
    // * get all examination types based on unitId
    this.router.get(
      this.path + "/units/:unitId",
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.examinationType.getExaminationTypesUnit
    );
    // * post unit examination types
    this.router.post(
      this.path + "/units",
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.examinationType.postExaminationTypesUnit
    );

    // * delete examination type
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.examinationType.deleteExaminationType
      );

    return this.router;
  }
}
