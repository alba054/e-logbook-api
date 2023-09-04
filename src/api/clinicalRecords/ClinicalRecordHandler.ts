import { Request, Response, NextFunction } from "express";
import { ClinicalRecordPayloadValidator } from "../../validator/clinicalRecords/ClinicalRecordValidator";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ClinicalRecordService } from "../../services/database/ClinicalRecordService";
import {
  IPostClinicalRecord,
  IPutFeedbackClinicalRecord,
  IPutVerificationStatusClinicalRecord,
} from "../../utils/interfaces/ClinicalRecord";
import { constants, createResponse } from "../../utils";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { UploadFileHelper } from "../../utils/helper/UploadFileHelper";
import {
  IClinicalRecordDetailDTO,
  IListClinicalRecordDTO,
} from "../../utils/dto/ClinicalRecordDTO";

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
    this.getClinicalRecordDetail = this.getClinicalRecordDetail.bind(this);
    this.putVerificationStatusClinicalRecord =
      this.putVerificationStatusClinicalRecord.bind(this);
    this.putFeedbackOfClinicalRecord =
      this.putFeedbackOfClinicalRecord.bind(this);
  }

  async putFeedbackOfClinicalRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutFeedbackClinicalRecord = req.body;

    try {
      const validationResult =
        this.clinicalRecordValidator.validatePutFeedbackClinicalRecord(payload);

      if (validationResult && "error" in validationResult) {
        switch (validationResult.error) {
          case 400:
            throw new BadRequestError(validationResult.message);
          case 404:
            throw new NotFoundError(validationResult.message);
          default:
            throw new InternalServerError();
        }
      }

      const result =
        await this.clinicalRecordService.giveFeedbackToClinicalRecord(
          id,
          tokenPayload,
          payload
        );

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

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, result));
    } catch (error) {
      return next(error);
    }
  }

  async putVerificationStatusClinicalRecord(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutVerificationStatusClinicalRecord = req.body;

    try {
      const validationResult =
        this.clinicalRecordValidator.validatePutVerificationStatus(payload);

      if (validationResult && "error" in validationResult) {
        switch (validationResult.error) {
          case 400:
            throw new BadRequestError(validationResult.message);
          case 404:
            throw new NotFoundError(validationResult.message);
          default:
            throw new InternalServerError();
        }
      }

      const result = await this.clinicalRecordService.verifyClinicalRecord(
        id,
        tokenPayload,
        payload
      );

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

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, result));
    } catch (error) {
      return next(error);
    }
  }

  async getClinicalRecordDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;

    try {
      const clinicalRecord =
        await this.clinicalRecordService.getClinicalRecordDetail(
          id,
          tokenPayload
        );

      if ("error" in clinicalRecord) {
        switch (clinicalRecord.error) {
          case 400:
            throw new BadRequestError(clinicalRecord.message);
          case 404:
            throw new NotFoundError(clinicalRecord.message);
          default:
            throw new InternalServerError();
        }
      }

      const affectedPartIds = {
        diagnosess: [] as string[],
        examinations: [] as string[],
        managements: [] as string[],
      };

      const diagnosess = [];
      const examinations = [];
      const managements = [];

      for (let i = 0; i < clinicalRecord.ClinicalRecordDiagnosis.length; i++) {
        const diagnosis = clinicalRecord.ClinicalRecordDiagnosis[i];
        const affectedPart = diagnosis.affectedPartId;
        if (affectedPartIds.diagnosess.includes(affectedPart)) {
          continue;
        }
        const types: string[] = [];

        affectedPartIds.diagnosess.push(affectedPart);

        for (
          let j = 0;
          j < clinicalRecord.ClinicalRecordDiagnosis.length;
          j++
        ) {
          const diagToSeekFor = clinicalRecord.ClinicalRecordDiagnosis[j];

          if (diagToSeekFor.affectedPartId === affectedPart) {
            types.push(diagToSeekFor.DiagnosisType.typeName);
          }
        }

        diagnosess.push({
          affectedPart: diagnosis.affectedPart.partName,
          diagnosesType: types,
        });
      }

      for (
        let i = 0;
        i < clinicalRecord.ClinicalRecordExamination.length;
        i++
      ) {
        const examination = clinicalRecord.ClinicalRecordExamination[i];
        const affectedPart = examination.affectedPartId;
        if (affectedPartIds.examinations.includes(affectedPart)) {
          continue;
        }
        const types: string[] = [];

        affectedPartIds.examinations.push(affectedPart);

        for (
          let j = 0;
          j < clinicalRecord.ClinicalRecordExamination.length;
          j++
        ) {
          const diagToSeekFor = clinicalRecord.ClinicalRecordExamination[j];

          if (diagToSeekFor.affectedPartId === affectedPart) {
            types.push(diagToSeekFor.examinationType.typeName);
          }
        }

        examinations.push({
          affectedPart: examination.affectedPart.partName,
          examinationType: types,
        });
      }

      for (let i = 0; i < clinicalRecord.ClinicalRecordManagement.length; i++) {
        const management = clinicalRecord.ClinicalRecordManagement[i];
        const affectedPart = management.affectedPartId;
        if (affectedPartIds.managements.includes(affectedPart)) {
          continue;
        }
        const types = [];

        affectedPartIds.managements.push(affectedPart);

        for (
          let j = 0;
          j < clinicalRecord.ClinicalRecordManagement.length;
          j++
        ) {
          const diagToSeekFor = clinicalRecord.ClinicalRecordManagement[j];

          if (diagToSeekFor.affectedPartId === affectedPart) {
            types.push({
              managementType: diagToSeekFor.managementType.typeName,
              managementRole: diagToSeekFor.managementRole.roleName,
            });
          }
        }

        managements.push({
          affectedPart: management.affectedPart.partName,
          management: types,
        });
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          attachments: clinicalRecord.attachment,
          diagnosess,
          examinations,
          managements,
          patientName: clinicalRecord.patientName,
          patientSex: clinicalRecord.gender,
          studentFeedback: clinicalRecord.studentFeedback,
          studentName: clinicalRecord.Student?.fullName,
          supervisorFeedback: clinicalRecord.supervisorFeedback,
          supervisorName: clinicalRecord.supervisor.fullname,
          filename: clinicalRecord.attachment?.split("/").at(-1),
          verificationStatus: clinicalRecord.verificationStatus,
          recordId: clinicalRecord.recordId,
          unit: clinicalRecord.Unit?.name,
        } as IClinicalRecordDetailDTO)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getAttachmentFile(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
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
        throw new BadRequestError("upload file with fieldname attachments");
      }

      const savedFile = UploadFileHelper.uploadFileBuffer(
        req.file.originalname,
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
    const { status, page, patient, name, nim, sortBy, order } = req.query;

    const tokenPayload: ITokenPayload = res.locals.user;

    const clinicalRecords =
      await this.clinicalRecordService.getSubmittedClinicalRecords(
        status,
        parseInt(String(page)),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        patient,
        name,
        nim,
        sortBy,
        order,
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
            status: c.verificationStatus,
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
