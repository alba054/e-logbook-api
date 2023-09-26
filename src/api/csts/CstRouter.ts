import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { constants } from "../../utils";
import { CstHandler } from "./CstHandler";

export class CstRouter {
  private path: string;
  private router: Router;
  private handler: CstHandler;

  constructor() {
    this.path = "/csts";
    this.router = Router();
    this.handler = new CstHandler();
  }

  register() {
    // * post cst
    // * get cst submitted by student
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.postCst
      )
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
          constants.CEU_BADGE,
        ]),
        this.handler.getCsts
      );

    // * verify cst by ceu after all topics is verified
    this.router
      .route(this.path + "/:id")
      .put(
        AuthorizationBearer.authorize([constants.CEU_BADGE]),
        this.handler.putVerificationStatusCst
      ).delete(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.deleteCst
      );

    // * get cst topics of student
    this.router
      .route(this.path + "/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
          constants.CEU_BADGE,
        ]),
        this.handler.getCstTopics
      );

    // * add topic of cst
    this.router
      .route(this.path + "/:id/topics")
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.putTopicCst
      );

    // * verify all topics by supervisor
    this.router
      .route(this.path + "/:id/topics/verify")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putAllTopicsVerificationStatus
      );

    // * verify cst topic
    this.router
      .route(this.path + "/topics/:topicId")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusCstTopic
      );
    
    // * edit cst 
    this.router
      .route(this.path + "/:id/edit")
      .put(
          AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.putCst
      );

    return this.router;
  }
}
