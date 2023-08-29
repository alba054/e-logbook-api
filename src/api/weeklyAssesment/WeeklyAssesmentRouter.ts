import { Router } from "express";
import { WeeklyAssesmentHandler } from "./WeeklyAssesmentHandler";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";
import { constants } from "../../utils";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";

export class WeeklyAssesmentRouter {
  private handler: WeeklyAssesmentHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/weekly-assesments";
    this.router = Router();
    this.handler = new WeeklyAssesmentHandler();
  }

  register() {
    // * score weekly assesment
    this.router
      .route(this.path + "/:id")
      .put(
        AuthorizationBearer.authorize([constants.ER_ROLE]),
        this.handler.putScoreWeeklyAssesment
      );

    // * get weekly assesments of student by er each unit
    this.router
      .route(this.path + "/students/:studentId/units/:unitId")
      .get(
        AuthorizationBearer.authorize([constants.ER_ROLE]),
        this.handler.getStudentWeeklyAssesmentsUnit
      )
      .put(
        AuthorizationBearer.authorize([constants.ER_ROLE]),
        this.handler.putVerificationStatus
      );

    return this.router;
  }
}
