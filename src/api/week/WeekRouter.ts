import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { WeekHandler } from "./WeekHandler";

export class WeekRouter {
  private path: string;
  private router: Router;
  private handler: WeekHandler;

  constructor() {
    this.path = "/weeks";
    this.router = Router();
    this.handler = new WeekHandler();
  }

  register() {
    // * post week for unit
    // * get all weeks
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.ADMIN_ROLE,
        ]),
        this.handler.postWeek
      )
      .get(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.ADMIN_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
          constants.STUDENT_ROLE,
        ]),
        this.handler.getWeeks
      );

    // * edit week
    // * delete week
    this.router
      .route(this.path + "/:id")
      .put(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.ADMIN_ROLE,
        ]),
        this.handler.putWeek
      )
      .delete(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.ADMIN_ROLE,
        ]),
        this.handler.deleteWeek
      );

    return this.router;
  }
}
