import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { constants } from "../../utils";
import { ScientificSessionHandler } from "./ScientificSessionHandler";

export class ScientificSessionRouter {
  private scientificSessionHandler: ScientificSessionHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/scientific-sessions";
    this.router = Router();
    this.scientificSessionHandler = new ScientificSessionHandler();
  }

  register() {
    // * submit scientific session
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.scientificSessionHandler.postScientificSession
      );

    return this.router;
  }
}
