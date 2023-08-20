import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { ActivityNameHandler } from "./ActivityNameHandler";

export class ActivityNameRouter {
  private activityNameHandler: ActivityNameHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/activity-names";
    this.router = Router();
    this.activityNameHandler = new ActivityNameHandler();
  }

  register() {
    // * get all activity names
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.activityNameHandler.getActivityNamesUnit
    );
    // * post unit activity names
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.activityNameHandler.postActivityNamesUnit
    );

    // * delete activity name
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.activityNameHandler.deleteActivityName
      );

    return this.router;
  }
}
