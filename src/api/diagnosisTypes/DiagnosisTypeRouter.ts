import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { DiagnosisTypeHandler } from "./DiagnosisTypeHandler";

export class DiagnosisTypeRouter {
  private diagnosisTypeHandler: DiagnosisTypeHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/diagnosis-types";
    this.router = Router();
    this.diagnosisTypeHandler = new DiagnosisTypeHandler();
  }

  register() {
    // * get all diagnosis types based on unitId
    this.router.get(
      this.path + "/units/:unitId",
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
      ]),
      this.diagnosisTypeHandler.getDiagnosisTypesUnit
    );
    // * post unit diagnosis types
    this.router.post(
      this.path + "/units",
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.diagnosisTypeHandler.postDiagnosisTypesUnit
    );

    return this.router;
  }
}
