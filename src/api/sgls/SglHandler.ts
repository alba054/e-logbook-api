import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { SglService } from "../../services/database/SglService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import { ISglDetail, IStudentSgl, ISubmittedSgl } from "../../utils/dto/SglDTO";
import { IPostSGL } from "../../utils/interfaces/Sgl";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { SglPayloadSchema } from "../../validator/sgl/SglSchema";
import { Validator } from "../../validator/Validator";

export class SglHandler {
  private validator: Validator;
  private sglService: SglService;
  private studentService: StudentService;

  constructor() {
    this.sglService = new SglService();
    this.validator = new Validator();
    this.studentService = new StudentService();

    this.getSgls = this.getSgls.bind(this);
    this.postSgl = this.postSgl.bind(this);
    this.getSglTopics = this.getSglTopics.bind(this);
  }

  async getSglTopics(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    const result = await this.sglService.getSglsBySupervisorAndStudentId(
      tokenPayload,
      studentId
    );

    const student = await this.studentService.getStudentByStudentId(studentId);
    if (student && "error" in student) {
      switch (student.error) {
        case 400:
          throw new BadRequestError(student.message);
        case 404:
          throw new NotFoundError(student.message);
        default:
          throw new InternalServerError();
      }
    }

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentId: student.studentId,
        studentName: student.fullName,
        sgls: result.map(
          (r) =>
            ({
              createdAt: r.createdAt,
              verificationStatus: r.verificationStatus,
              topic: r.topics.map((t) => ({
                topicName: t.topic?.name,
                verificationStatus: t.verificationStatus,
                endTime: Number(t.endTime),
                notes: t.notes,
                startTime: Number(t.startTime),
              })),
            } as ISglDetail)
        ),
      } as IStudentSgl)
    );
  }

  async getSgls(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const result = await this.sglService.getSglsBySupervisor(tokenPayload);

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        result.map((r) => {
          return {
            latest: r.updatedAt,
            studentId: r.Student?.studentId,
            studentName: r.Student?.fullName,
          } as ISubmittedSgl;
        })
      )
    );
  }

  async postSgl(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostSGL = req.body;

    try {
      const result = this.validator.validate(SglPayloadSchema, payload);

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

      const testError = await this.sglService.insertNewSgl(
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
            "successfully post sgl"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
