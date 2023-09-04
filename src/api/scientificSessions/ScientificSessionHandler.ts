import { NextFunction, Request, RequestHandler, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { ScientificSessionService } from "../../services/database/ScientificSessionService";
import { constants, createResponse } from "../../utils";
import {
  IListScientificSessionDTO,
  IScientificSessionDetail,
} from "../../utils/dto/ScientificSessionDTO";
import { UploadFileHelper } from "../../utils/helper/UploadFileHelper";
import {
  IPostScientificSessionPayload,
  IPutFeedbackScientificSession,
  IPutVerificationStatusScientificSession,
} from "../../utils/interfaces/ScientificSession";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { ScientificSessionFeedbackSchema } from "../../validator/scientificSessions/ScientificSessionSchema";
import { ScientificSessionValidator } from "../../validator/scientificSessions/ScientificSessionValidator";

export class ScientificSessionHandler {
  private scientificSessionValidator: ScientificSessionValidator;
  private scientificSessionService: ScientificSessionService;

  constructor() {
    this.scientificSessionValidator = new ScientificSessionValidator();
    this.scientificSessionService = new ScientificSessionService();

    this.postScientificSession = this.postScientificSession.bind(this);
    this.postUploadedAttachment = this.postUploadedAttachment.bind(this);
    this.getScientificSessionDetail =
      this.getScientificSessionDetail.bind(this);
    this.putVerificationStatusScientificSession =
      this.putVerificationStatusScientificSession.bind(this);
    this.getSubmittedScientificSessions =
      this.getSubmittedScientificSessions.bind(this);
    this.getAttachmentFile = this.getAttachmentFile.bind(this);
    this.putFeedbackOfScientificSession =
      this.putFeedbackOfScientificSession.bind(this);
  }

  async putFeedbackOfScientificSession(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutFeedbackScientificSession = req.body;

    try {
      const validationResult = this.scientificSessionValidator.validate(
        ScientificSessionFeedbackSchema,
        payload
      );

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
        await this.scientificSessionService.giveFeedbackToScientificSession(
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

  async getAttachmentFile(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const tokenPayload: ITokenPayload = res.locals.user;
      const fileToSend =
        await this.scientificSessionService.getAttachmentByScientificSessionId(
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

  async getSubmittedScientificSessions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { status, name, nim, page } = req.query;

    const tokenPayload: ITokenPayload = res.locals.user;
    const scientificSessions =
      await this.scientificSessionService.getSubmittedScientificSessions(
        status,
        parseInt(String(page)),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        name,
        nim,
        tokenPayload.supervisorId
      );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        scientificSessions.map((c) => {
          return {
            studentId: c.Student?.studentId,
            studentName: c.Student?.fullName,
            time: c.createdAt,
            attachment: c.attachment,
            id: c.id,
            status: c.verificationStatus,
          } as IListScientificSessionDTO;
        })
      )
    );
  }

  async putVerificationStatusScientificSession(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutVerificationStatusScientificSession = req.body;

    try {
      const validationResult =
        this.scientificSessionValidator.validatePutVerificationStatus(payload);

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
        await this.scientificSessionService.verifyScientificSession(
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

  async getScientificSessionDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;

    try {
      const scientificSession =
        await this.scientificSessionService.getScientificSessionDetail(
          id,
          tokenPayload
        );

      if ("error" in scientificSession) {
        switch (scientificSession.error) {
          case 400:
            throw new BadRequestError(scientificSession.message);
          case 404:
            throw new NotFoundError(scientificSession.message);
          default:
            throw new InternalServerError();
        }
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          rating: scientificSession.rating,
          reference: scientificSession.reference,
          role: scientificSession.scientificRole.name,
          studentName: scientificSession.Student?.fullName,
          supervisorName: scientificSession.supervisor.fullname,
          title: scientificSession.title,
          topic: scientificSession.topic,
          updatedAt: scientificSession.updatedAt,
          attachment: scientificSession.attachment,
          filename: scientificSession.attachment?.split("/").at(-1),
          sessionType: scientificSession.sessionType.name,
          unit: scientificSession.Unit?.name,
          verificationStatus: scientificSession.verificationStatus,
          studentFeedback: scientificSession.studentFeedback,
          supervisorFeedback: scientificSession.supervisorFeedback,
        } as IScientificSessionDetail)
      );
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
        req.file.originalname,
        constants.SCIENTIFIC_SESSION_ATTACHMENT_PATH,
        req.file.buffer
      );

      return res
        .status(201)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, savedFile));
    } catch (error) {
      return next(error);
    }
  }

  async postScientificSession(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostScientificSessionPayload = req.body;

    try {
      const result =
        this.scientificSessionValidator.validatePostPayload(payload);

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
        await this.scientificSessionService.insertNewScientificSession(
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
            "successfully post scientific session"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
