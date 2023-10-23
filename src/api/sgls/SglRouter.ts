import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { constants } from "../../utils";
import { SglHandler } from "./SglHandler";

export class SglRouter {
  private path: string;
  private router: Router;
  private handler: SglHandler;

  constructor() {
    this.path = "/sgls";
    this.router = Router();
    this.handler = new SglHandler();
  }

  register() {
    // * post sgl
    // * get sgl submitted by student
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.postSgl
      )
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
          constants.CEU_BADGE,
        ]),
        this.handler.getSgls
      );

    // * verify sgl by ceu after all topics is verified
    this.router
      .route(this.path + "/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
          constants.CEU_BADGE,
                    constants.STUDENT_ROLE,
        ]),
        this.handler.getSgl
      )
      .put(
        AuthorizationBearer.authorize([constants.CEU_BADGE]),
        this.handler.putVerificationStatusSgl
      ).delete(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.deleteSgl,
      );

    // * get sgl topics of student
    this.router
      .route(this.path + "/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
          constants.CEU_BADGE,
        ]),
        this.handler.getSglTopics
      );

    // * add topic of sgl
    this.router
      .route(this.path + "/:id/topics")
      .put(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.putTopicSgl
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

    // * verify sgl topic
    this.router
      .route(this.path + "/topics/:topicId")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusSglTopic
      );
    
    // * edit sgl
    this.router
      .route(this.path + "/:id/edit")
      .put(
          AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.putSgl
      );
      
    return this.router;
  }
}
