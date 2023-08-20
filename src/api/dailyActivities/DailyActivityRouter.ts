import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { DailyActivityHandler } from "./DailyActivityHandler";

export class DailyActivityRouter {
  private path: string;
  private router: Router;
  private handler: DailyActivityHandler;

  constructor() {
    this.path = "/daily-activities";
    this.router = Router();
    this.handler = new DailyActivityHandler();
  }

  register() {
    // // * get list of activities per week
    // this.router
    //   .route(this.path)
    //   .get(
    //     AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
    //     this.handler.getDailySubmitted
    //   );

    // * fill daily activity
    this.router
      .route(this.path + "/activities/:id")
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.putDailyActivityActivity
      );

    return this.router;
  }
}
