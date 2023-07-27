import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { SessionTypeHandler } from "./SessionTypeHandler";

export class SessionTypeRouter {
  private sessionTypeHandler: SessionTypeHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/session-types";
    this.router = Router();
    this.sessionTypeHandler = new SessionTypeHandler();
  }

  register() {
    // * get all session types
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.sessionTypeHandler.getSessionTypes
    );
    // * post session type
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.sessionTypeHandler.postSessionType
    );

    return this.router;
  }
}
