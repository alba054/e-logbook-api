import { Request, Response, NextFunction, RequestHandler } from "express";
import { ClinicalRecordPayloadValidator } from "../../validator/clinicalRecords/ClinicalRecordValidator";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ClinicalRecordService } from "../../services/database/ClinicalRecordService";
import { IPostClinicalRecord } from "../../utils/interfaces/ClinicalRecord";
import { constants, createResponse } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { UploadFileHelper } from "../../utils/helper/UploadFileHelper";

export class ClinicalRecordHandler {
  private clinicalRecordValidator: ClinicalRecordPayloadValidator;
  private clinicalRecordService: ClinicalRecordService;

  constructor() {
    this.clinicalRecordService = new ClinicalRecordService();
    this.clinicalRecordValidator = new ClinicalRecordPayloadValidator();

    this.postClinicalRecord = this.postClinicalRecord.bind(this);
    this.getSubmittedClinicalRecords =
      this.getSubmittedClinicalRecords.bind(this);
    this.postUploadedAttachment = this.postUploadedAttachment.bind(this);
  }

  async postUploadedAttachment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      console.log(req.file);

      if (!req.file?.buffer) {
        throw new BadRequestError("upload file with fieldname attachment");
      }

      const savedFile = UploadFileHelper.uploadFileBuffer(
        constants.CLINICAL_RECORD_ATTACHMENT_PATH,
        req.file.buffer
      );

      return res
        .status(201)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, savedFile));
    } catch (error) {
      return next(error);
    }
  }

  async getSubmittedClinicalRecords(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { status } = req.query;

    const tokenPayload: ITokenPayload = res.locals.user;
    const clinicalRecords =
      await this.clinicalRecordService.getSubmittedClinicalRecords(
        status,
        tokenPayload.supervisorId
      );

    return res
      .status(200)
      .json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, clinicalRecords)
      );
  }

  async postClinicalRecord(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostClinicalRecord = req.body;

    try {
      const result = this.clinicalRecordValidator.validatePostPayload(payload);

      if (result && "error" in result) {
        switch (result.error) {
          case 400:
            throw new BadRequestError(result.message);
          case 404:
            throw new NotFoundError(result.message);
          default:
            throw new InternalServerError();
        }
      }

      const testError =
        await this.clinicalRecordService.insertNewClinicalRecord(
          tokenPayload,
          payload
        );

      if (testError && "error" in testError) {
        switch (testError.error) {
          case 400:
            throw new BadRequestError(testError.message);
          case 404:
            throw new NotFoundError(testError.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(201)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully post clinical record"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
