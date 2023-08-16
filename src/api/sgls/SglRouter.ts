import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { constants } from "../../utils";
import { SglHandler } from "./SglHandler";

export class SglRouter {
  private path: string;
  private router: Router;
  private handler: SglHandler;

  constructor() {
    this.path = "/sgls";
    this.router = Router();
    this.handler = new SglHandler();
  }

  register() {
    // * post sgl
    // * get sgl submitted by student
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.postSgl
      )
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getSgls
      );

    // * get sgl topics of student
    this.router
      .route(this.path + "/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getSglTopics
      );

    return this.router;
  }
}
