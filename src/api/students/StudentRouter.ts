import { Router } from "express";
import { StudentHandler } from "./StudentHandler";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";

export class StudentRouter {
  studentHandler: StudentHandler;
  path: string;
  router: Router;

  constructor() {
    this.path = "/students";
    this.router = Router();
    this.studentHandler = new StudentHandler();
  }

  register() {
    // * register
    this.router.post(
      this.path,
      BasicAuthMiddleware.authenticateAdmin(),
      this.studentHandler.postStudent
    );
    // * send otp and token for reset password
    this.router.get(
      this.path + "/:username/reset-password",
      BasicAuthMiddleware.authenticateAdmin(),
      this.studentHandler.getStudentForgetPassword
    );
    // * reset password based on token and otp
    this.router.post(
      this.path + "/:username/reset-password/:token",
      BasicAuthMiddleware.authenticateAdmin(),
      this.studentHandler.postStudentResetPassword
    );

    // * test authorization for student
    this.router.get(
      this.path + "/test-authorization-student",
      AuthorizationBearer.authorize([constants.CEU_BADGE]),
      this.studentHandler.getTestAuthorizationStudent
    );

    return this.router;
  }
}
