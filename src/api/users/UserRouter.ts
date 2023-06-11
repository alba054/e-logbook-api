import { Router } from "express";
import { UserHandler } from "./UserHandler";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";

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
    // * login
    this.router.post(
      this.path + "/login",
      BasicAuthMiddleware.checkBasicAuth(),
      this.userHandler.postUserLogin
    );
    // * refresh access token
    this.router.post("/refresh-token", this.userHandler.postRefreshToken);

    return this.router;
  }
}
