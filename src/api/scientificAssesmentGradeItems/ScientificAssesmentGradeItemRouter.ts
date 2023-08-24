import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { ScientificAssesmentGradeItemHandler } from "./ScientificAssesmentGradeItemHandler";

export class scientificAssesmentGradeItemRouter {
  private handler: ScientificAssesmentGradeItemHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/scientific-assesment-grade-items";
    this.router = Router();
    this.handler = new ScientificAssesmentGradeItemHandler();
  }

  register() {
    // * get all scientific assesment grade items
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.handler.getScientificAssesmentGradeItems
    );
    // * post  scientific assesment grade items
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.handler.postScientificAssesmentGradeItem
    );

    // * delete scientific assesment grade items
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.handler.deleteScientificAssesmentGradeItem
      );

    return this.router;
  }
}
