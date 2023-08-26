import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { PersonalBehaviourGradeItemHandler } from "./PersonalBehaviourGradeItemHandler";

export class PersonalBehaviourGradeItemRouter {
  private handler: PersonalBehaviourGradeItemHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/personal-behaviour-grade-items";
    this.router = Router();
    this.handler = new PersonalBehaviourGradeItemHandler();
  }

  register() {
    // * get all personal behaviour grade items
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.handler.getPersonalBehaviourGradeItems
    );
    // * post  personal behaviour grade items
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.handler.postPersonalBehaviourGradeItem
    );

    // * delete personal behaviour grade items
    this.router
      .route(this.path + "/:id")
      .delete(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.handler.deletePersonalBehaviourGradeItem
      );

    return this.router;
  }
}
