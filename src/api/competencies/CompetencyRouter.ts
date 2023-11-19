import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { constants } from "../../utils";
import { CompetencyHandler } from "./CompetencyHandler";

export class CompetencyRouter {
  private handler: CompetencyHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/competencies";
    this.router = Router();
    this.handler = new CompetencyHandler();
  }

  register() {
    // * get submitted competencies (skills and cases merged)
    this.router
      .route(this.path)
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getCompetencies
      );

    // * add new skill
    // * get student submitted skills by supervisor or dpk
    this.router
      .route(this.path + "/skills")
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.postSkill
      )
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getSkills
      );

    // * add new case
    // * get student submitted skills by supervisor or dpk
    this.router
      .route(this.path + "/cases")
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.handler.postCase
      )
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getCases
      );

    // * get list of skills of spesific student
    // * verify all student skills
    this.router
      .route(this.path + "/skills/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getStudentSkills
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusStudentSkills
      );

    // * get list of cases of spesific student
    // * verify all student cases
    this.router
      .route(this.path + "/cases/students/:studentId")
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.getStudentCases
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusStudentCases
      );

    // * verify skill by id
    this.router
      .route(this.path + "/skills/:id")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusSkill
      )
      .delete(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.deleteSkill
      );

    // * verify case by id
    this.router
      .route(this.path + "/cases/:id")
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.handler.putVerificationStatusCase
      )
      .delete(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        this.handler.deleteCase
      );

    return this.router;
  }
}
