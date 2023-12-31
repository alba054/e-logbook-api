import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { AssesmentService } from "../../services/database/AssesmentService";
import { constants, createErrorObject, createResponse } from "../../utils";
import {
  IListMiniCex,
  IListScientificAssesment,
  IListStudentAssesment,
  IMiniCexDetail,
  IPersonalBehaviourDetail,
  IStudentAssesmentUnit,
} from "../../utils/dto/AssesmentDTO";
import {
  IPostMiniCex,
  IPutGradeItemMiniCex,
  IPutGradeItemMiniCexScore,
  IPutGradeItemMiniCexScoreV2,
  IPutGradeItemPersonalBehaviourVerificationStatus,
  IPutStudentAssesmentScore,
} from "../../utils/interfaces/Assesment";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  AssesmentScoreSchema,
  GradeItemMiniCexSchema,
  GradeItemMiniCexScoreSchema,
  GradeItemMiniCexScoreV2Schema,
  GradeItemPersonalBehaviourVerificationStatusSchema,
  MiniCexPayloadSchema,
} from "../../validator/assesment/AssesmentSchema";
import { Validator } from "../../validator/Validator";

export class AssesmentHandler {
  private assesmentService: AssesmentService;
  private validator: Validator;

  constructor() {
    this.assesmentService = new AssesmentService();
    this.validator = new Validator();

    this.getAssesmentMiniCexs = this.getAssesmentMiniCexs.bind(this);
    this.postAssesmentMiniCex = this.postAssesmentMiniCex.bind(this);
    this.getScientificAssesments = this.getScientificAssesments.bind(this);
    this.getMiniCexDetail = this.getMiniCexDetail.bind(this);
    this.putMiniCexGradeItem = this.putMiniCexGradeItem.bind(this);
    this.putMiniCexGradeItemScore = this.putMiniCexGradeItemScore.bind(this);
    this.getScientificAssesmentDetail =
      this.getScientificAssesmentDetail.bind(this);
    this.putScientificAssesmentGradeItemScore =
      this.putScientificAssesmentGradeItemScore.bind(this);
    this.putMiniCexGradeItemScoreV2 =
      this.putMiniCexGradeItemScoreV2.bind(this);
    this.getPersonalBehaviours = this.getPersonalBehaviours.bind(this);
    this.getPersonalBehaviourDetail =
      this.getPersonalBehaviourDetail.bind(this);
    this.putVerificationStatusPersonalBehaviourGradeItem =
      this.putVerificationStatusPersonalBehaviourGradeItem.bind(this);
    this.getStudentAssesments = this.getStudentAssesments.bind(this);
    this.getStudentAssesmentsUnit = this.getStudentAssesmentsUnit.bind(this);
    this.putAssesmentScore = this.putAssesmentScore.bind(this);
    this.postAssesmentScientificAsessment =
      this.postAssesmentScientificAsessment.bind(this);
    this.putVerifiedAssesment = this.putVerifiedAssesment.bind(this);
  }

  async putVerifiedAssesment(req: Request, res: Response, next: NextFunction) {
    const { studentId, unitId } = req.params;
    const { verified } = req.body;

    try {
      if (typeof verified === "undefined") {
        return createErrorObject(400, "provide verified");
      }

      await this.assesmentService.submitFinalScore(
        studentId,
        unitId,
        Boolean(verified)
      );

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "succesfully submit final score"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postAssesmentScientificAsessment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostMiniCex = req.body;

    try {
      const validationResult = this.validator.validate(
        MiniCexPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const result = await this.assesmentService.addScientificAssesment(
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
        .status(201)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully post assesment scientific assesment"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async putAssesmentScore(req: Request, res: Response, next: NextFunction) {
    const { studentId, unitId } = req.params;
    const payload: IPutStudentAssesmentScore = req.body;

    try {
      const validationResult = this.validator.validate(
        AssesmentScoreSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      await this.assesmentService.scoreOsceOrCBT(studentId, unitId, payload);

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "succesfully score assesment"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getStudentAssesmentsUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { studentId, unitId } = req.params;

    const assesments =
      await this.assesmentService.getAssesmentsByStudentIdAndUnitId(
        studentId,
        unitId
      );

    let finalScore = 0;
    const responses: IStudentAssesmentUnit[] = [];

    assesments.forEach((a) => {
      let grade = 0;
      if (a.MiniCex) {
        if (a.MiniCex.MiniCexGrade) {
          a.MiniCex.MiniCexGrade.forEach((g) => {
            grade += g.score ?? 0;
          });
          grade = grade / (a.MiniCex.MiniCexGrade.length || 1);
          // grade *= a.MiniCex.weight;
        }
      }

      if (a.ScientificAssesment) {
        if (a.ScientificAssesment?.grades) {
          a.ScientificAssesment?.grades.forEach((g) => {
            grade += g.score ?? 0;
          });
          grade = grade / a.ScientificAssesment?.grades.length;
          // grade *= a.ScientificAssesment.weight;
        }
      }

      if (a.osce) {
        grade = a.osce.score ?? 0;
        // grade *= a.osce.weight;
      }

      if (a.cbt) {
        grade = a.cbt.score ?? 0;
        // grade *= a.cbt.weight;
      }

      finalScore =
        finalScore +
        grade *
          (a.MiniCex?.weight ??
            a.ScientificAssesment?.weight ??
            a.osce?.weight ??
            a.cbt?.weight ??
            0);
      responses.push({
        type: a.type,
        weight:
          a.MiniCex?.weight ??
          a.ScientificAssesment?.weight ??
          a.osce?.weight ??
          a.cbt?.weight ??
          0,
        score: grade,
      } as IStudentAssesmentUnit);
    });

    if (!responses.filter((r) => r.type === "MINI_CEX").length) {
      responses.push({
        type: "MINI_CEX",
        weight: 0.25,
        score: null,
      } as IStudentAssesmentUnit);
    }

    if (!responses.filter((r) => r.type === "SCIENTIFIC_ASSESMENT").length) {
      responses.push({
        type: "SCIENTIFIC_ASSESMENT",
        weight: 0.15,
        score: null,
      } as IStudentAssesmentUnit);
    }

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        finalScore,
        verified:
          assesments.filter((a) => a.osce !== null)[0]?.osce?.verified ?? null,
        assesments: responses,
      })
    );
  }

  async getStudentAssesments(req: Request, res: Response, next: NextFunction) {
    const { studentId } = req.params;

    const assesments = await this.assesmentService.getAssesmentsByStudentId(
      studentId
    );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        assesments.map((a) => {
          return {
            studentId: a.Student?.studentId,
            studentName: a.Student?.fullName,
            unitName: a.Unit?.name,
            unitId: a.Unit?.id,
          } as IListStudentAssesment;
        })
      )
    );
  }

  async putVerificationStatusPersonalBehaviourGradeItem(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutGradeItemPersonalBehaviourVerificationStatus = req.body;

    try {
      const validationResult = this.validator.validate(
        GradeItemPersonalBehaviourVerificationStatusSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const miniCex =
        await this.assesmentService.verifyPersonalBehaviourGradeItem(
          tokenPayload,
          id,
          payload
        );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, "success update personal behaviour"));
    } catch (error) {
      return next(error);
    }
  }

  async getPersonalBehaviourDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    try {
      const miniCex = await this.assesmentService.getPersonalBehaviourById(
        tokenPayload,
        id
      );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          id: miniCex.personalBehaviourId,
          studentId: miniCex.Student?.studentId,
          studentName: miniCex.Student?.fullName,
          scores: miniCex.PersonalBehaviour?.PersonalBehaviourGrade.map((g) => {
            return {
              name: g.gradeItem.name,
              verificationStatus: g.verificationStatus,
              id: g.id,
              type: g.gradeItem.personalBehaviourGradeType,
            };
          }),
        } as IPersonalBehaviourDetail)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getPersonalBehaviours(req: Request, res: Response, next: NextFunction) {
    const { studentId } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    const personalBehaviours =
      await this.assesmentService.getPersonalBehavioursByStudentId(
        tokenPayload,
        studentId
      );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        personalBehaviours.map((p) => {
          return {
            id: p?.personalBehaviourId,
            studentId: p?.Student?.studentId,
            studentName: p?.Student?.fullName,
          } as IListScientificAssesment;
        })
      )
    );
  }

  async putMiniCexGradeItemScoreV2(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutGradeItemMiniCexScoreV2 = req.body;

    try {
      const validationResult = this.validator.validate(
        GradeItemMiniCexScoreV2Schema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const miniCex = await this.assesmentService.scoreMiniCexV2(
        tokenPayload,
        id,
        payload
      );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, "success score minicex"));
    } catch (error) {
      return next(error);
    }
  }

  async putScientificAssesmentGradeItemScore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutGradeItemMiniCexScore = req.body;

    try {
      const validationResult = this.validator.validate(
        GradeItemMiniCexScoreSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const miniCex = await this.assesmentService.scoreScientificAssesment(
        tokenPayload,
        id,
        payload
      );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, "success update score"));
    } catch (error) {
      return next(error);
    }
  }

  async getScientificAssesmentDetail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    try {
      const miniCex = await this.assesmentService.getScientificAssesmentById(
        tokenPayload,
        id
      );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }

      // * grade will be zero if no minicexgrade
      let grade = 0;
      if (miniCex.ScientificAssesment?.grades) {
        miniCex.ScientificAssesment?.grades.forEach((g) => {
          grade += g.score ?? 0;
        });
        grade = grade / miniCex.ScientificAssesment?.grades.length;
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          id: miniCex.scientificAssesmentId,
          studentId: miniCex.Student?.studentId,
          studentName: miniCex.Student?.fullName,
          case: miniCex.ScientificAssesment?.title,
          location: miniCex.ScientificAssesment?.location?.name,
          scores: miniCex.ScientificAssesment?.grades.map((g) => {
            return {
              name: g.gradeItem.name,
              score: g.score,
              id: g.id,
              type: g.gradeItem.scientificGradeType,
            };
          }),
          grade,
          academicSupervisorId: miniCex.Student?.academicSupervisorId,
          examinerDPKId: miniCex.Student?.examinerSupervisorId,
          supervisingDPKId: miniCex.Student?.supervisingSupervisorId,
        } as IMiniCexDetail)
      );
    } catch (error) {
      return next(error);
    }
  }

  async putMiniCexGradeItemScore(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutGradeItemMiniCexScore = req.body;

    try {
      const validationResult = this.validator.validate(
        GradeItemMiniCexScoreSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const miniCex = await this.assesmentService.scoreMiniCex(
        tokenPayload,
        id,
        payload
      );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, miniCex));
    } catch (error) {
      return next(error);
    }
  }

  async putMiniCexGradeItem(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutGradeItemMiniCex = req.body;

    try {
      const validationResult = this.validator.validate(
        GradeItemMiniCexSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const miniCex = await this.assesmentService.addGradeItemToMiniCex(
        tokenPayload,
        id,
        payload
      );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, miniCex));
    } catch (error) {
      return next(error);
    }
  }

  async getMiniCexDetail(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    try {
      const miniCex = await this.assesmentService.getMiniCexsById(
        tokenPayload,
        id
      );

      if (miniCex && "error" in miniCex) {
        switch (miniCex.error) {
          case 400:
            throw new BadRequestError(miniCex.message);
          case 404:
            throw new NotFoundError(miniCex.message);
          default:
            throw new InternalServerError();
        }
      }

      // * grade will be zero if no minicexgrade
      let grade = 0;
      if (miniCex.MiniCex?.MiniCexGrade) {
        miniCex.MiniCex?.MiniCexGrade.forEach((g) => {
          grade += g.score ?? 0;
        });
        grade = grade / miniCex.MiniCex?.MiniCexGrade.length;
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          case: miniCex.MiniCex?.case,
          id: miniCex.miniCexId,
          location: miniCex.MiniCex?.location?.name,
          studentId: miniCex.Student?.studentId,
          studentName: miniCex.Student?.fullName,
          scores: miniCex.MiniCex?.MiniCexGrade.map((g) => {
            return {
              name: g.name,
              score: g.score,
              id: g.id,
            };
          }),
          grade,
          academicSupervisorId: miniCex.Student?.academicSupervisorId,
          examinerDPKId: miniCex.Student?.examinerSupervisorId,
          supervisingDPKId: miniCex.Student?.supervisingSupervisorId,
        } as IMiniCexDetail)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getScientificAssesments(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { studentId } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    const scientificAssesment =
      await this.assesmentService.getScientificAssesmentByStudentId(
        tokenPayload,
        studentId
      );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        scientificAssesment.map((s) => {
          return {
            id: s?.scientificAssesmentId,
            studentId: s?.Student?.studentId,
            studentName: s?.Student?.fullName,
            case: s.ScientificAssesment?.title,
            location: s.ScientificAssesment?.location?.name,
          } as IListScientificAssesment;
        })
      )
    );
  }

  async postAssesmentMiniCex(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostMiniCex = req.body;

    try {
      const validationResult = this.validator.validate(
        MiniCexPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const result = await this.assesmentService.addMiniCexAssesment(
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
        .status(201)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "successfully post assesment mini cex"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getAssesmentMiniCexs(req: Request, res: Response, next: NextFunction) {
    const { studentId } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;

    const miniCexs = await this.assesmentService.getMiniCexsByStudentId(
      tokenPayload,
      studentId
    );

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        case: miniCexs?.MiniCex?.case,
        location: miniCexs?.MiniCex?.location?.name,
        studentId: miniCexs?.Student?.studentId,
        id: miniCexs?.MiniCex?.id,
        studentName: miniCexs?.Student?.fullName,
      } as IListMiniCex)
    );
  }
}
