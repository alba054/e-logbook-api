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
    // * get activity by supervisor or dpk opted
    this.router
      .route(this.path)
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getActivities
      );

    // * fill daily activity
    this.router
      .route(this.path + "/days/:dayId/")
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.putDailyActivityActivity
      )
    
    // * get submitted daily activities by supervisor or dpk
    this.router
      .route(this.path + "/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getSubmittedActivities
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusOfDailyActivities
      );

    // * get submitted activities of daily activity by supervisor or dpk
    // * verify daily activity per week
    this.router
      .route(this.path + "/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getActivitiesOfDailyActivity
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusOfDailyActivity
      );

    return this.router;
  }
}
