import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { ReferenceService } from "../../services/database/ReferenceService";
import { constants, createResponse } from "../../utils";
import { UploadFileHelper } from "../../utils/helper/UploadFileHelper";

export class ReferenceHandler {
  private referenceService: ReferenceService;

  constructor() {
    this.referenceService = new ReferenceService();

    this.postUploadedFileReference = this.postUploadedFileReference.bind(this);
    this.getAllReferences = this.getAllReferences.bind(this);
    this.getReferenceFile = this.getReferenceFile.bind(this);
    this.getReferecesByUnit = this.getReferecesByUnit.bind(this);
  }

  async getReferecesByUnit(req: Request, res: Response, next: NextFunction) {
    const { unitId } = req.params;

    const references = await this.referenceService.getReferencesByUnit(unitId);

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, references));
  }

  async getReferenceFile(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const fileToSend = await this.referenceService.getReferenceFileById(
        Number(id)
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

  async getAllReferences(req: Request, res: Response, next: NextFunction) {
    const references = await this.referenceService.getAllReferences();

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, references));
  }

  async postUploadedFileReference(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { unitId } = req.params;

    try {
      if (!req.file?.buffer) {
        throw new BadRequestError("upload file with fieldname file");
      }

      const savedFile = UploadFileHelper.uploadFileBuffer(
        req.file.originalname,
        constants.REFERENCE_PATH,
        req.file.buffer,
        true
      );

      await this.referenceService.uploadReferenceByUnitId(savedFile, unitId);

      return res
        .status(201)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, savedFile));
    } catch (error) {
      return next(error);
    }
  }
}
