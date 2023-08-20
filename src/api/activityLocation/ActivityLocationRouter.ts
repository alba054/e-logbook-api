import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { ActivityLocationHandler } from "./ActivityLocationHandler";

export class ActivityLocationRouter {
  private activityLocationHandler: ActivityLocationHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/activity-locations";
    this.router = Router();
    this.activityLocationHandler = new ActivityLocationHandler();
  }

  register() {
    // * get all activity locations
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.activityLocationHandler.getActivityLocationsUnit
    );
    // * post unit Management roles
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.activityLocationHandler.postActivityLocationsUnit
    );

    // * delete management role
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.activityLocationHandler.deleteActivityLocation
      );

    return this.router;
  }
}
