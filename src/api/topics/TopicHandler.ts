import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { TopicService } from "../../services/database/TopicService";
import { constants, createResponse } from "../../utils";
import { IPostTopicPayload } from "../../utils/interfaces/Topic";
import { TopicPayloadSchema } from "../../validator/topics/TopicSchema";
import { Validator } from "../../validator/Validator";

export class TopicHandler {
  private topicService: TopicService;
  private validator: Validator;

  constructor() {
    this.topicService = new TopicService();
    this.validator = new Validator();

    this.getTopics = this.getTopics.bind(this);
    this.postTopic = this.postTopic.bind(this);
    this.deleteTopic = this.deleteTopic.bind(this);
  }

  async deleteTopic(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const result = await this.topicService.deleteTopicById(Number(id));

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
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully delete topic"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postTopic(req: Request, res: Response, next: NextFunction) {
    const payload: IPostTopicPayload = req.body;

    try {
      const validationResult = this.validator.validate(
        TopicPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }
      const testError = await this.topicService.insertTopic(payload);

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
            "successfully insert topics"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getTopics(req: Request, res: Response, next: NextFunction) {
    const topics = await this.topicService.getTopics();

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, topics));
  }
}
