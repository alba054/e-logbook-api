import { Request, Response, NextFunction } from "express";
import { ClinicalRecordPayloadValidator } from "../../validator/clinicalRecords/ClinicalRecordValidator";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ClinicalRecordService } from "../../services/database/ClinicalRecordService";
import { IPostClinicalRecord } from "../../utils/interfaces/ClinicalRecord";

export class ClinicalRecordHandler {
  private clinicalRecordValidator: ClinicalRecordPayloadValidator;
  private clinicalRecordService: ClinicalRecordService;

  constructor() {
    this.clinicalRecordService = new ClinicalRecordService();
    this.clinicalRecordValidator = new ClinicalRecordPayloadValidator();
  }

  async postClinicalRecord(req: Request, res: Response, next: NextFunction) {
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

      await this.clinicalRecordService.insertNewClinicalRecord(payload);
    } catch (error) {
      return next(error);
    }
  }
}
