import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { AssesmentHandler } from "./AssesmentHandler";

export class AssesmentRouter {
  private path: string;
  private router: Router;
  private handler: AssesmentHandler;

  constructor() {
    this.path = "/assesments";
    this.router = Router();
    this.handler = new AssesmentHandler();
  }

  register() {
    // * post new mini cex by student
    this.router
      .route(this.path + "/mini-cexs")
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.postAssesmentMiniCex
      );

    // * get mini cex detail
    // * add grade item to mini cex one by one
    this.router
      .route(this.path + "/mini-cexs/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getMiniCexDetail
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putMiniCexGradeItem
      );

    // * give a score to each mini cex grade item
    this.router
      .route(this.path + "/mini-cexs/:id/score")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putMiniCexGradeItemScore
      );

    // * give a score to each mini cex grade item v2
    this.router
      .route(this.path + "/mini-cexs/:id/score/v2")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putMiniCexGradeItemScoreV2
      );

    // * get mini cex of spesific student
    this.router
      .route(this.path + "/mini-cexs/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getAssesmentMiniCexs
      );

    // * get scientific assesment detail
    this.router
      .route(this.path + "/scientific-assesments/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getScientificAssesmentDetail
      );

    // * give a score to each scientific assesment grade item
    this.router
      .route(this.path + "/scientific-assesments/:id/score")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putScientificAssesmentGradeItemScore
      );

    // * get scientific assesment of spesific student
    this.router
      .route(this.path + "/scientific-assesments/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getScientificAssesments
      );

    // * get personal behaviour detail
    this.router
      .route(this.path + "/personal-behaviours/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getPersonalBehaviourDetail
      );

    // * verify each personal behaviour grade item
    this.router
      .route(this.path + "/personal-behaviours/:id/items")
      .put(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusPersonalBehaviourGradeItem
      );

    // * get personal behavoiur of spesific student
    this.router
      .route(this.path + "/personal-behaviours/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getPersonalBehaviours
      );

    return this.router;
  }
}
