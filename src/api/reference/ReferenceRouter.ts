import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { multerHelper } from "../../utils/helper/MulterHelper";
import { ReferenceHandler } from "./ReferenceHandler";

export class ReferenceRouter {
  private path: string;
  private router: Router;
  private handler: ReferenceHandler;

  constructor() {
    this.path = "/references";
    this.router = Router();
    this.handler = new ReferenceHandler();
  }

  register() {
    // * get all references
    // * post reference all units
    this.router
      .route(this.path)
      .get(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        this.handler.getAllReferences
      )
      .post(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        multerHelper.upload.single("file"),
        this.handler.postUploadedFileReferenceToAllUnits
      );

    // * get reference file
    this.router
      .route(this.path + "/:id")
      .get(
        AuthorizationBearer.authorize([
          constants.STUDENT_ROLE,
          constants.ADMIN_ROLE,
        ]),
        this.handler.getReferenceFile
      );

    // * upload file reference per unit
    this.router
      .route(this.path + "/units/:unitId")
      .post(
        AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
        multerHelper.upload.single("file"),
        this.handler.postUploadedFileReference
      )
      .get(
        AuthorizationBearer.authorize([
          constants.ADMIN_ROLE,
          constants.STUDENT_ROLE,
        ]),
        this.handler.getReferecesByUnit
      );

    return this.router;
  }
}
