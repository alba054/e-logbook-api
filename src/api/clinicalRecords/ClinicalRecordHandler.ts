import { Request, Response, NextFunction } from "express";
import { ClinicalRecordPayloadValidator } from "../../validator/clinicalRecords/ClinicalRecordValidator";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ClinicalRecordService } from "../../services/database/ClinicalRecordService";
import { IPostClinicalRecord } from "../../utils/interfaces/ClinicalRecord";
import { constants, createResponse } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";

export class ClinicalRecordHandler {
  private clinicalRecordValidator: ClinicalRecordPayloadValidator;
  private clinicalRecordService: ClinicalRecordService;

  constructor() {
    this.clinicalRecordService = new ClinicalRecordService();
    this.clinicalRecordValidator = new ClinicalRecordPayloadValidator();

    this.postClinicalRecord = this.postClinicalRecord.bind(this);
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

      await this.clinicalRecordService.insertNewClinicalRecord(
        tokenPayload,
        payload
      );

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
