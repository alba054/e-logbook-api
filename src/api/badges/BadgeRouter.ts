import { Router } from "express";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";
import { BadgeHandler } from "./BadgeHandler";

export class BadgeRouter {
  private path: string;
  private router: Router;
  private badgeHandler: BadgeHandler;

  constructor() {
    this.path = "/badges";
    this.router = Router();
    this.badgeHandler = new BadgeHandler();
  }

  register() {
    // * get all units
    // * post new unit
    this.router
      .route(this.path)
      .get(
        BasicAuthMiddleware.authenticateAdmin(),
        this.badgeHandler.getBadges
      );

    return this.router;
  }
}
