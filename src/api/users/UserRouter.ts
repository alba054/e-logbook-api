import { Router } from "express";
import { UserHandler } from "./UserHandler";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";

export class UserRouter {
  userHandler: UserHandler;
  path: string;
  router: Router;

  constructor() {
    this.path = "/users";
    this.router = Router();
    this.userHandler = new UserHandler();
  }

  register() {
    // * credential
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.CEU_BADGE,
        constants.ER_BADGE,
        constants.STUDENT_ROLE,
        constants.HEAD_DIV_BADGE,
        constants.SUPERVISOR_ROLE,
      ]),
      this.userHandler.getUserProfile
    );
    // * login
    this.router.post(
      this.path + "/login",
      BasicAuthMiddleware.authenticate(),
      this.userHandler.postUserLogin
    );
    // * post new user except for student
    this.router.post(
      this.path,
      BasicAuthMiddleware.authenticateAdmin(),
      this.userHandler.postUser
    );
    // * refresh access token
    this.router.post(
      this.path + "/refresh-token",
      this.userHandler.postRefreshToken
    );

    return this.router;
  }
}
