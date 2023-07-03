import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { SupervisorHandler } from "./SupervisorHandler";

export class SupervisorRouter {
  private path: string;
  private router: Router;
  private supervisorHandler: SupervisorHandler;

  constructor() {
    this.path = "/supervisors";
    this.router = Router();
    this.supervisorHandler = new SupervisorHandler();
  }

  register() {
    // * get all supervisors
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.supervisorHandler.getSupervisors
    );
    // * post new supervisor
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.supervisorHandler.postSupervisor
    );
    // * register a badge to supervisor
    this.router.post(
      this.path + "/badges",
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.supervisorHandler.postBadgeToSupervisor
    );

    return this.router;
  }
}
