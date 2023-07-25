import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { UnitCheckIn } from "../../middleware/unitActivity/UnitCheckIn";
import { constants } from "../../utils";
import { multerHelper } from "../../utils/helper/MulterHelper";
import { ScientificSessionHandler } from "./ScientificSessionHandler";

export class ScientificSessionRouter {
  private scientificSessionHandler: ScientificSessionHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/scientific-sessions";
    this.router = Router();
    this.scientificSessionHandler = new ScientificSessionHandler();
  }

  register() {
    // * submit scientific session
    // * get submitted scientific session by supervisor and dpk
    this.router
      .route(this.path)
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        this.scientificSessionHandler.postScientificSession
      )
      .get(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.scientificSessionHandler.getSubmittedScientificSessions
      );

    // * upload attachment
    this.router
      .route(this.path + "/attachments")
      .post(
        AuthorizationBearer.authorize([constants.STUDENT_ROLE]),
        UnitCheckIn.restrictUncheckInActiveUnit(),
        multerHelper.upload.single("attachments"),
        this.scientificSessionHandler.postUploadedAttachment
      );

    // * scientific session detail
    // * verify scientific session
    this.router
      .route(this.path + "/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.scientificSessionHandler.getScientificSessionDetail
      )
      .put(
        AuthorizationBearer.authorize([
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.scientificSessionHandler.putVerificationStatusScientificSession
      );

    // * get scientific session attachment
    this.router
      .route(this.path + "/:id/attachments")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.scientificSessionHandler.getAttachmentFile
      );

    // * give feedback to scientific session
    this.router
      .route(this.path + "/:id/feedback")
      .put(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.SUPERVISOR_ROLE,
          constants.DPK_ROLE,
        ]),
        this.scientificSessionHandler.putFeedbackOfScientificSession
      );

    return this.router;
  }
}
