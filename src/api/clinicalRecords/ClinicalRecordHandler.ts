import { Request, Response, NextFunction } from "express";
import { ClinicalRecordPayloadValidator } from "../../validator/clinicalRecords/ClinicalRecordValidator";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ClinicalRecordService } from "../../services/database/ClinicalRecordService";
import { IPostClinicalRecord } from "../../utils/interfaces/ClinicalRecord";
import { constants, createResponse } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { UploadFileHelper } from "../../utils/helper/UploadFileHelper";
import { IListClinicalRecordDTO } from "../../utils/dto/ClinicalRecordDTO";

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
    this.getAttachmentFile = this.getAttachmentFile.bind(this);
  }

  async getAttachmentFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const tokenPayload: ITokenPayload = res.locals.user;
      const fileToSend =
        await this.clinicalRecordService.getAttachmentByClinicalRecordId(
          id,
          tokenPayload
        );

      if (typeof fileToSend === "string") {
        return res.sendFile(`${constants.ABS_PATH}/${fileToSend}`);
      }
      switch (fileToSend?.error) {
        case 400:
          throw new BadRequestError(fileToSend.message);
        case 404:
          throw new NotFoundError(fileToSend.message);
        default:
          throw new InternalServerError();
      }
    } catch (error) {
      return next(error);
    }
  }

  async postUploadedAttachment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
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

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        clinicalRecords.map((c) => {
          return {
            patientName: c.patientName,
            studentId: c.Student?.studentId,
            studentName: c.Student?.fullName,
            time: c.createdAt,
            attachment: c.attachment,
            id: c.id,
          } as IListClinicalRecordDTO;
        })
      )
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
