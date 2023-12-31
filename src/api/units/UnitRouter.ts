import { Router } from "express";
import { UnitHandler } from "./UnitHandler";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";

export class UnitRouter {
  unitHandler: UnitHandler;
  path: string;
  router: Router;

  constructor() {
    this.path = "/units";
    this.router = Router();
    this.unitHandler = new UnitHandler();
  }

  register() {
    // * get all units
    // * post new unit
    this.router
      .route(this.path)
      .get(
        BasicAuthMiddleware.authenticateAdmin(),
        this.unitHandler.getAllUnits
      )
      .post(BasicAuthMiddleware.authenticateAdmin(), this.unitHandler.postUnit);

    // * delete unit by id
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.unitHandler.deleteUnit
      );

    return this.router;
  }
}
