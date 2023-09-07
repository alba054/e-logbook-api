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
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.ADMIN_ROLE,
        ]),
        this.handler.postWeek
      );

    return this.router;
  }
}
