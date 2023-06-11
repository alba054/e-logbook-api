import { Router } from "express";
import { StudentHandler } from "./StudentHandler";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";

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
      BasicAuthMiddleware.checkBasicAuth(),
      this.studentHandler.postStudent
    );
    // * send otp and token for reset password
    this.router.get(
      this.path + "/:username/reset-password",
      BasicAuthMiddleware.checkBasicAuth(),
      this.studentHandler.getStudentForgetPassword
    );
    // * reset password based on token and otp
    this.router.post(
      this.path + "/:username/reset-password/:token",
      BasicAuthMiddleware.checkBasicAuth(),
      this.studentHandler.postStudentResetPassword
    );

    return this.router;
  }
}
