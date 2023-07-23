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
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.postSelfReflection
      );

    return this.router;
  }
}
