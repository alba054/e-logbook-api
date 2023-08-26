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
    // * get student profile by token reset password
    this.router
      .route(this.path + "/reset-password/:token")
      .post(
        BasicAuthMiddleware.authenticateAdmin(),
        this.studentHandler.postStudentResetPassword
      )
      .get(
        BasicAuthMiddleware.authenticateAdmin(),
        this.studentHandler.getStudentProfileByResetPasswordToken
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

    // * get list of clinical records submitted
    this.router
      .route(this.path + "/clinical-records")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getStudentClinicalRecords
      );

    // * get list of scientific sessions submitted
    this.router
      .route(this.path + "/scientific-sessions")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getStudentScientificSessions
      );

    // * get list of self reflections submitted
    this.router
      .route(this.path + "/self-reflections")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getStudentSelfReflections
      );

    // * get list of cases submitted
    this.router
      .route(this.path + "/cases")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getStudentCases
      );

    // * get list of skills submitted
    this.router
      .route(this.path + "/skills")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getStudentSkills
      );

    // * get daily activities
    this.router
      .route(this.path + "/daily-activities")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getDailyActivities
      );

    // * get list of activities per week
    this.router
      .route(this.path + "/daily-activities/:id")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getDailyActivitiesPerWeek
      );

    // * get student mini cex
    this.router
      .route(this.path + "/mini-cexs")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getMiniCexs
      );

    // * get student scientific assesment
    this.router
      .route(this.path + "/scientific-assesments")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getScientificAssesments
      );

    // * get student personal behaviours
    this.router
      .route(this.path + "/personal-behaviours")
      .get(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.studentHandler.getPersonalBehaviours
      );

    return this.router;
  }
}
