import { Router } from "express";
import { ClinicalRecordHandler } from "./ClinicalRecordHandler";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";

export class UnitRouter {
  clinicalRecordHandler: ClinicalRecordHandler;
  path: string;
  router: Router;

  constructor() {
    this.path = "/clinical-records";
    this.router = Router();
    this.clinicalRecordHandler = new ClinicalRecordHandler();
  }

  register() {
    // * student post new clinical record
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.STUDENT_ROLE]),

      this.clinicalRecordHandler.postClinicalRecord
    );
  }
}
