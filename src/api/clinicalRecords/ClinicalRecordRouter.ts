import { Router } from "express";
import { ClinicalRecordHandler } from "./ClinicalRecordHandler";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";

export class ClinicalRecordRouter {
  private clinicalRecordHandler: ClinicalRecordHandler;
  private path: string;
  private router: Router;

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
      UnitCheckIn.restrictUncheckInActiveUnit(),
      this.clinicalRecordHandler.postClinicalRecord
    );
    // * get submitted student clinical record
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.clinicalRecordHandler.getSubmittedClinicalRecords
    );

    return this.router;
  }
}
