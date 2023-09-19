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

      const diagnosess = [];
      const examinations = [];
      const managements = [];

      for (let i = 0; i < clinicalRecord.ClinicalRecordDiagnosis.length; i++) {
        const types: string[] = [];

        for (
          let j = 0;
          j < clinicalRecord.ClinicalRecordDiagnosis.length;
          j++
        ) {
          const diagToSeekFor = clinicalRecord.ClinicalRecordDiagnosis[j];

          types.push(diagToSeekFor.DiagnosisType.typeName);
        }

        diagnosess.push({
          diagnosesType: types,
        });
      }

      for (
        let i = 0;
        i < clinicalRecord.ClinicalRecordExamination.length;
        i++
      ) {
        const types: string[] = [];

        for (
          let j = 0;
          j < clinicalRecord.ClinicalRecordExamination.length;
          j++
        ) {
          const diagToSeekFor = clinicalRecord.ClinicalRecordExamination[j];

          types.push(diagToSeekFor.examinationType.typeName);
        }

        examinations.push({
          examinationType: types,
        });
      }

      for (let i = 0; i < clinicalRecord.ClinicalRecordManagement.length; i++) {
        const types = [];

        for (
          let j = 0;
          j < clinicalRecord.ClinicalRecordManagement.length;
          j++
        ) {
          const diagToSeekFor = clinicalRecord.ClinicalRecordManagement[j];

          types.push({
            managementType: diagToSeekFor.managementType.typeName,
            managementRole: diagToSeekFor.managementRole.roleName,
          });
        }

        managements.push({
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
          rating: clinicalRecord.rating,
          notes: clinicalRecord.notes,
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
    let { status, page, patient, name, nim, sortBy, order } = req.query;

    const tokenPayload: ITokenPayload = res.locals.user;

    const clinicalRecords =
      await this.clinicalRecordService.getSubmittedClinicalRecords(
        status,
        parseInt(String(page ?? "1")),
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
        clinicalRecords.data.map((c) => {
          return {
            patientName: c.patientName,
            studentId: c.Student?.studentId,
            studentName: c.Student?.fullName,
            time: c.createdAt,
            attachment: c.attachment,
            id: c.id,
            status: c.verificationStatus,
            pages:
              Math.ceil(
                clinicalRecords.count / constants.HISTORY_ELEMENTS_PER_PAGE
              ) === 0
                ? 1
                : Math.ceil(
                    clinicalRecords.count / constants.HISTORY_ELEMENTS_PER_PAGE
                  ),
            unitName: c.Unit?.name,
            rating: c.rating,
            notes: c.notes,
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
