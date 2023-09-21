import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { SelfReflectionService } from "../../services/database/SelfReflectionService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import {
  ISelfReflectionDetailDTO,
  IStudentSelfReflections,
  ISubmittedSelfReflections,
} from "../../utils/dto/SelfReflectionDTO";
import {
  IPostSelfReflection,
  IPutSelfReflection,
  IPutSelfReflectionVerificationStatus,
} from "../../utils/interfaces/SelfReflection";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  SelfReflectionPayloadSchema,
  SelfReflectionVerificationStatusSchema,
} from "../../validator/selfReflections/SelfReflectionSchema";
import { SelfReflectionValidator } from "../../validator/selfReflections/SelfReflectionValidator";

export class SelfReflectionHandler {
  private selfReflectionValidator: SelfReflectionValidator;
  private selfReflectionService: SelfReflectionService;
  private studentService: StudentService;

  constructor() {
    this.selfReflectionValidator = new SelfReflectionValidator();
    this.selfReflectionService = new SelfReflectionService();
    this.studentService = new StudentService();

    this.postSelfReflection = this.postSelfReflection.bind(this);
    this.getSubmittedSelfReflections =
      this.getSubmittedSelfReflections.bind(this);
    this.getStudentSelfReflections = this.getStudentSelfReflections.bind(this);
    this.putSelfReflectionVerificationStatus =
      this.putSelfReflectionVerificationStatus.bind(this);
    this.getSelfReflectionDetail = this.getSelfReflectionDetail.bind(this);
    this.putSelfReflectionDetail = this.putSelfReflectionDetail.bind(this);
  }

  async putSelfReflectionDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutSelfReflection = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.selfReflectionValidator.validate(
        SelfReflectionPayloadSchema,
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

      const result = await this.selfReflectionService.updateSelfReflection(
        tokenPayload,
        id,
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
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully update self reflection"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getSelfReflectionDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;

    try {
      const selfReflection =
        await this.selfReflectionService.getSelfReflectionById(
          tokenPayload,
          id
        );

      if (selfReflection && "error" in selfReflection) {
        switch (selfReflection.error) {
          case 400:
            throw new BadRequestError(selfReflection.message);
          case 404:
            throw new NotFoundError(selfReflection.message);
          default:
            throw new InternalServerError();
        }
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          content: selfReflection.content,
          selfReflectionId: selfReflection.id,
          studentId: selfReflection.Student?.studentId,
          studentName: selfReflection.Student?.fullName,
          verificationStatus: selfReflection.verificationStatus,
        } as ISelfReflectionDetailDTO)
      );
    } catch (error) {
      return next(error);
    }
  }

  async putSelfReflectionVerificationStatus(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutSelfReflectionVerificationStatus = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.selfReflectionValidator.validate(
        SelfReflectionVerificationStatusSchema,
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

      const result = await this.selfReflectionService.verifySelfReflection(
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

  async getStudentSelfReflections(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    try {
      const student = await this.studentService.getStudentByStudentId(
        studentId
      );

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

      const selfReflections =
        await this.selfReflectionService.getSelfReflectionsByStudentId(
          tokenPayload,
          studentId,
          student.unitId ?? ""
        );

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          studentName: student?.fullName,
          studentId: studentId,
          listSelfReflections: selfReflections.map((s) => {
            return {
              content: s.content,
              selfReflectionId: s.id,
              verificationStatus: s.verificationStatus,
            };
          }),
        } as IStudentSelfReflections)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getSubmittedSelfReflections(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { page, search, name, nim } = req.query;

    let selfReflections: any;

    if (!page) {
      selfReflections =
        await this.selfReflectionService.getSelfReflectionsBySupervisorWithoutPage(
          tokenPayload
        );
    } else {
      selfReflections =
        await this.selfReflectionService.getSelfReflectionsBySupervisor(
          tokenPayload,
          parseInt(String(page ?? "1")),
          constants.HISTORY_ELEMENTS_PER_PAGE,
          search,
          name,
          nim
        );
    }

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        selfReflections.data.map((s: any) => {
          return {
            latest: s.createdAt,
            studentId: s.Student?.studentId,
            studentName: s.Student?.fullName,
            unitName: s.Unit?.name,
            pages:
              Math.ceil(
                selfReflections.count / constants.HISTORY_ELEMENTS_PER_PAGE
              ) === 0
                ? 1
                : Math.ceil(
                    selfReflections.count / constants.HISTORY_ELEMENTS_PER_PAGE
                  ),
          } as ISubmittedSelfReflections;
        })
      )
    );
  }

  async postSelfReflection(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostSelfReflection = req.body;

    try {
      const result = this.selfReflectionValidator.validatePostPayload(payload);

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
        await this.selfReflectionService.insertNewSelfReflection(
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
            "successfully post self reflection"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
