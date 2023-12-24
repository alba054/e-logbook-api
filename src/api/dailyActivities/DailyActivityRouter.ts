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
      .route(this.path + "/activities/:id")
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.putDailyActivityActivityV2
      );

    // * fill daily activity
    this.router
      .route(this.path + "/days/:dayId/")
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.putDailyActivityActivity
      );

    // * get submitted daily activities by supervisor or dpk
    this.router
      .route(this.path + "/students/:studentId/v2")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getSubmittedActivitiesV2
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusOfDailyActivitiesV2
      );

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
      .route(this.path + "/:id/v2")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getActivitiesOfDailyActivityV2
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusOfDailyActivityV2
      );

    // * get submitted activities of daily activity by supervisor or dpk
    // * verify daily activity per week
    this.router
      .route(this.path + "/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
          constants.STUDENT_ROLE,
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

    // * get activities on week
    this.router
      .route(this.path + "/students/:studentId/weeks/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.DPK_ROLE,
          constants.SUPERVISOR_ROLE,
        ]),
        this.handler.getStudentActivities
      );

    return this.router;
  }
}
