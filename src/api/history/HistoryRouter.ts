import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { HistoryHandler } from "./HistoryHandler";

export class HistoryRouter {
  path: string;
  router: Router;
  historyHandler: HistoryHandler;

  constructor() {
    this.path = "/history";
    this.router = Router();
    this.historyHandler = new HistoryHandler();
  }

  register() {
    // get history
    this.router
      .route(this.path + "/:page?")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.ER_ROLE,
          constants.ADMIN_ROLE,
          constants.DPK_ROLE,
        ]),
        this.historyHandler.getHistory
      );

    return this.router;
  }
}
