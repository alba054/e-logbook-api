import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { constants } from "../../utils";
import { SelfReflectionHandler } from "./SelfReflectionHandler";

export class SelfReflectionRouter {
  handler: SelfReflectionHandler;
  path: string;
  router: Router;

  constructor() {
    this.path = "/self-reflections";
    this.router = Router();
    this.handler = new SelfReflectionHandler();
  }

  register() {
    // * add new self reflection
    // * get student self reflections
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.postSelfReflection
      )
      .get(
        AuthorizationBearer.authorize([
          constants.DPK_ROLE,
          constants.SUPERVISOR_ROLE,
        ]),
        this.handler.getSubmittedSelfReflections
      );

    // * get student self reflections by supervisor
    this.router
      .route(this.path + "/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getStudentSelfReflections
      );

    // * verify self reflection
    this.router
      .route(this.path + "/:id")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putSelfReflectionVerificationStatus
      );

    return this.router;
  }
}
