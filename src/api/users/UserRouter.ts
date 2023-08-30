import { Router } from "express";
import { UserHandler } from "./UserHandler";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { multerHelper } from "../../utils/helper/MulterHelper";

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
    // * update user profile
    // * post a new admin
    this.router
      .route(this.path)
      .get(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.ADMIN_ROLE,
          constants.DPK_ROLE,
        ]),
        this.userHandler.getUserProfile
      )
      .put(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.DPK_ROLE,
          constants.ADMIN_ROLE,
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
        ]),
        this.userHandler.putUserProfile
      )
      .post(BasicAuthMiddleware.authenticateAdmin(), this.userHandler.postUser);
    // * login
    this.router.post(
      this.path + "/login",
      BasicAuthMiddleware.authenticate(),
      this.userHandler.postUserLogin
    );
    this.router;
    // * refresh access token
    this.router.post(
      this.path + "/refresh-token",
      this.userHandler.postRefreshToken
    );

    this.router
      .route(this.path + "/pic")
      .post(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.ER_ROLE,
          constants.DPK_ROLE,
          constants.ADMIN_ROLE,
        ]),
        multerHelper.upload.single("pic"),
        this.userHandler.postProfilePicture
      )
      .get(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.DPK_ROLE,
          constants.ADMIN_ROLE,
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
        ]),
        this.userHandler.getUserProfilePic
      )
      .delete(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.DPK_ROLE,
          constants.ADMIN_ROLE,
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
        ]),
        this.userHandler.deleteUserProfilePic
      );

    this.router
      .route(this.path + "/:id/pic")
      .get(
        AuthorizationBearer.authorize([
          constants.ER_ROLE,
          constants.DPK_ROLE,
          constants.ADMIN_ROLE,
          constants.SUPERVISOR_ROLE,
        ]),
        this.userHandler.getUserProfilePicByUserId
      );

    this.router
      .route(this.path + "/master")
      .get(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.userHandler.getAllUsers
      );

    return this.router;
  }
}
