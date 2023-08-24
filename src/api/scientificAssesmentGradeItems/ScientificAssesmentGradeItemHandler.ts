import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { ScientificAssesmentGradeItemService } from "../../services/database/ScientificAssesmentGradeItemService";
import { constants, createResponse } from "../../utils";
import { IPostScientificAssesmentGradeItemPayload } from "../../utils/interfaces/ScientificAssesmentGradeItem";
import { ScientificAssesmentGradeItemPayloadSchema } from "../../validator/scientificAssesmentGradeItems/ScientificAssesmentGradeItemSchema";
import { Validator } from "../../validator/Validator";

export class ScientificAssesmentGradeItemHandler {
  private scientificAssesmentGradeItemService: ScientificAssesmentGradeItemService;
  private validator: Validator;

  constructor() {
    this.scientificAssesmentGradeItemService =
      new ScientificAssesmentGradeItemService();
    this.validator = new Validator();

    this.getScientificAssesmentGradeItems =
      this.getScientificAssesmentGradeItems.bind(this);
    this.postScientificAssesmentGradeItem =
      this.postScientificAssesmentGradeItem.bind(this);
    this.deleteScientificAssesmentGradeItem =
      this.deleteScientificAssesmentGradeItem.bind(this);
  }

  async deleteScientificAssesmentGradeItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;

    try {
      const result =
        await this.scientificAssesmentGradeItemService.deleteScientificAssesmentGradeItemById(
          Number(id)
        );

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully delete scientific assesment grade item"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postScientificAssesmentGradeItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const payload: IPostScientificAssesmentGradeItemPayload = req.body;

    try {
      const validationResult = this.validator.validate(
        ScientificAssesmentGradeItemPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError =
        await this.scientificAssesmentGradeItemService.insertScientificAssesmentGradeItemsUnit(
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
            "successfully insert scientific assesment grade items"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getScientificAssesmentGradeItems(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const ScientificAssesmentGradeItems =
      await this.scientificAssesmentGradeItemService.getScientificAssesmentGradeItemByUnitId();

    return res
      .status(200)
      .json(
        createResponse(
          constants.SUCCESS_RESPONSE_MESSAGE,
          ScientificAssesmentGradeItems
        )
      );
  }
}
