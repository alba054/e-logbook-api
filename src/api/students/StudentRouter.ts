import { Router } from "express";
import { StudentHandler } from "./StudentHandler";
import { BasicAuthMiddleware } from "../../middleware/auth/BasicAuth";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";

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
    this.router.post(
      this.path + "/reset-password",
      BasicAuthMiddleware.authenticateAdmin(),
      this.studentHandler.postStudentForgetPassword
    );
    // * reset password based on token and otp
    this.router.post(
      this.path + "/reset-password/:token",
      BasicAuthMiddleware.authenticateAdmin(),
      this.studentHandler.postStudentResetPassword
    );

    // * set active unit
    this.router.put(
      this.path + "/units/set-unit",
      AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
      UnitCheckIn.restrictUnitActiveChanges(),
      this.studentHandler.putActiveUnit
    );

    // * check in current active unit
    this.router.post(
      this.path + "/units/check-in",
      AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
      UnitCheckIn.restrictUnitActiveChanges(),
      this.studentHandler.postCheckInActiveUnit
    );

    // * get active unit
    this.router.get(
      this.path + "/units",
      AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
      this.studentHandler.getActiveUnit
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
