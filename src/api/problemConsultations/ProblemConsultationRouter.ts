import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { constants } from "../../utils";
import { ProblemConsultationHandler } from "./ProblemConsultationHandler";

export class ProblemConsultationRouter {
  handler: ProblemConsultationHandler;
  path: string;
  router: Router;

  constructor() {
    this.path = "/problem-consultations";
    this.router = Router();
    this.handler = new ProblemConsultationHandler();
  }

  register() {
    // * add new self reflection
    // * get student self reflections
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.postProblemConsultation
      )
      .get(
        AuthorizationBearer.authorize([
          constants.DPK_ROLE,
          constants.SUPERVISOR_ROLE,
        ]),
        this.handler.getSubmittedProblemConsultations
      );

    // * get student self reflections by supervisor
    this.router
      .route(this.path + "/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getStudentProblemConsultations
      );

    // * verify self reflection
    // * self reflection detail
    this.router
      .route(this.path + "/:id")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putProblemConsultationVerificationStatus
      )
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
          constants.STUDENT_ROLE,
        ]),
        this.handler.getProblemConsultationDetail
      );

    // * update self reflection
    this.router
      .route(this.path + "/:id/update")
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.putProblemConsultationDetail
      );

    return this.router;
  }
}
