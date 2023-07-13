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
    // * edit profile
    this.router
      .route(this.path)
      .post(
        BasicAuthMiddleware.authenticateAdmin(),
        this.studentHandler.postStudent
      )
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.putStudentProfile
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
    // * get active unit
    this.router
      .route(this.path + "/units")
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUnitActiveChanges(),
        this.studentHandler.putActiveUnit
      )
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getActiveUnit
      );

    // * check in current active unit
    this.router.post(
      this.path + "/units/check-in",
      AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
      UnitCheckIn.restrictUnitActiveChanges(),
      this.studentHandler.postCheckInActiveUnit
    );

    // * test authorization for student
    this.router.get(
      this.path + "/test-authorization-student",
      AuthorizationBearer.authorize([constants.CEU_BADGE]),
      this.studentHandler.getTestAuthorizationStudent
    );

    // * get all inprocess check ins student
    this.router.get(
      this.path + "/checkins",
      AuthorizationBearer.authorize([constants.HEAD_DIV_BADGE]),
      this.studentHandler.getAllCheckInsStudent
    );

    // * verify student inprocess checkin
    this.router.put(
      this.path + "/checkins/:studentId",
      AuthorizationBearer.authorize([constants.HEAD_DIV_BADGE]),
      this.studentHandler.putVerificationCheckIn
    );

    // * assign supervisors to student
    this.router
      .route(this.path + "/supervisors")
      .put(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.studentHandler.putStudentSupervisors
      );

    return this.router;
  }
}
