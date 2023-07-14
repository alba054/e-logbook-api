import { Router } from "express";
import { ClinicalRecordHandler } from "./ClinicalRecordHandler";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { multerHelper } from "../../utils/helper/MulterHelper";

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
    // * upload attachment
    // * get attachment file
    this.router
      .route(this.path + "/attachments")
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        multerHelper.upload.single("attachments"),
        this.clinicalRecordHandler.postUploadedAttachment
      );

    this.router
      .route(this.path + "/:id/attachments")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
        ]),
        this.clinicalRecordHandler.getAttachmentFile
      );

    return this.router;
  }
}
