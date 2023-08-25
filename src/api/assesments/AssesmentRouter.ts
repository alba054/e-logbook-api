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

    // * get scientific assesment of spesific student
    this.router
      .route(this.path + "/mini-cexs/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getScientificAssesments
      );

    return this.router;
  }
}