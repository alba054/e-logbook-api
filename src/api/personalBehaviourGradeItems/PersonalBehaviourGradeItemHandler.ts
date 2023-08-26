import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { PersonalBehaviourGradeItemService } from "../../services/database/PersonalBehaviourGradeItemService";
import { constants, createResponse } from "../../utils";
import { IPostPersonalBehaviourGradeItemPayload } from "../../utils/interfaces/PersonalBehaviourGradeItem";
import { PersonalBehaviourGradeItemPayloadSchema } from "../../validator/personalBehaviourGradeItems/PersonalBehaviourGradeItemSchema";
import { Validator } from "../../validator/Validator";

export class PersonalBehaviourGradeItemHandler {
  private personalBehaviourGradeItemsService: PersonalBehaviourGradeItemService;
  private validator: Validator;

  constructor() {
    this.personalBehaviourGradeItemsService =
      new PersonalBehaviourGradeItemService();
    this.validator = new Validator();

    this.getPersonalBehaviourGradeItems =
      this.getPersonalBehaviourGradeItems.bind(this);
    this.postPersonalBehaviourGradeItem =
      this.postPersonalBehaviourGradeItem.bind(this);
    this.deletePersonalBehaviourGradeItem =
      this.deletePersonalBehaviourGradeItem.bind(this);
  }

  async deletePersonalBehaviourGradeItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;

    try {
      const result =
        await this.personalBehaviourGradeItemsService.deletePersonalBehaviourGradeItemById(
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

  async postPersonalBehaviourGradeItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const payload: IPostPersonalBehaviourGradeItemPayload = req.body;

    try {
      const validationResult = this.validator.validate(
        PersonalBehaviourGradeItemPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError =
        await this.personalBehaviourGradeItemsService.insertPersonalBehaviourGradeItemsUnit(
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

  async getPersonalBehaviourGradeItems(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const PersonalBehaviourGradeItems =
      await this.personalBehaviourGradeItemsService.getPersonalBehaviourGradeItemByUnitId();

    return res
      .status(200)
      .json(
        createResponse(
          constants.SUCCESS_RESPONSE_MESSAGE,
          PersonalBehaviourGradeItems
        )
      );
  }
}
