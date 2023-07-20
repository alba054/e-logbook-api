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
    this.router
      // * student post new clinical record
      // * get submitted student clinical record
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.clinicalRecordHandler.postClinicalRecord
      )
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.clinicalRecordHandler.getSubmittedClinicalRecords
      );
    // * upload attachment
    this.router
      .route(this.path + "/attachments")
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        multerHelper.upload.single("attachments"),
        this.clinicalRecordHandler.postUploadedAttachment
      );

    // * clinical record detail
    // * verify clinical record
    this.router
      .route(this.path + "/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.clinicalRecordHandler.getClinicalRecordDetail
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.clinicalRecordHandler.putVerificationStatusClinicalRecord
      );
    // * get clinical record attachment
    this.router
      .route(this.path + "/:id/attachments")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.clinicalRecordHandler.getAttachmentFile
      );

    // * give feedback to clinical record
    this.router
      .route(this.path + "/:id/feedback")
      .put(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.clinicalRecordHandler.putFeedbackOfClinicalRecord
      );

    return this.router;
  }
}
