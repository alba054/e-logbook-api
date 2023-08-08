import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { CaseService } from "../../services/database/CaseService";
import { SkillService } from "../../services/database/SkillService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import { IStudentCases, ISubmittedCase } from "../../utils/dto/CaseDTO";
import { IStudentSkills, ISubmittedSkill } from "../../utils/dto/SkillDTO";
import {
  IPostCase,
  IPutCaseVerificationStatus,
} from "../../utils/interfaces/Case";
import {
  IPostSkill,
  IPutSkillVerificationStatus,
} from "../../utils/interfaces/Skill";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  CasePayloadSchema,
  CaseVerificationStatusSchema,
} from "../../validator/cases/CaseSchema";
import {
  SkillPayloadSchema,
  SkillVerificationStatusSchema,
} from "../../validator/Skill/SkillSchema";
import { SkillValidator } from "../../validator/Skill/SkillValidator";
import { Validator } from "../../validator/Validator";

export class CompetencyHandler {
  private skillValidator: SkillValidator;
  private skillService: SkillService;
  private validator: Validator;
  private caseService: CaseService;
  private studentService: StudentService;

  constructor() {
    this.skillValidator = new SkillValidator();
    this.skillService = new SkillService();
    this.validator = new Validator();
    this.caseService = new CaseService();
    this.studentService = new StudentService();

    this.postSkill = this.postSkill.bind(this);
    this.postCase = this.postCase.bind(this);
    this.getSkills = this.getSkills.bind(this);
    this.getCases = this.getCases.bind(this);
    this.getStudentSkills = this.getStudentSkills.bind(this);
    this.getStudentCases = this.getStudentCases.bind(this);
    this.putVerificationStatusStudentCases =
      this.putVerificationStatusStudentCases.bind(this);
    this.putVerificationStatusStudentSkills =
      this.putVerificationStatusStudentSkills.bind(this);
    this.putVerificationStatusSkill =
      this.putVerificationStatusSkill.bind(this);
    this.putVerificationStatusCase = this.putVerificationStatusCase.bind(this);
  }

  async putVerificationStatusCase(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutCaseVerificationStatus = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.validator.validate(
        CaseVerificationStatusSchema,
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

      const result = await this.caseService.verifyCase(
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

  async putVerificationStatusSkill(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutSkillVerificationStatus = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.validator.validate(
        SkillVerificationStatusSchema,
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

      const result = await this.skillService.verifySkill(
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

  async putVerificationStatusStudentSkills(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    try {
      const result = await this.skillService.verifyAllStudentSkills(
        tokenPayload,
        studentId
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
            "successfully verify all skills"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async putVerificationStatusStudentCases(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    try {
      const result = await this.caseService.verifyAllStudentCases(
        tokenPayload,
        studentId
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
            "successfully verify all cases"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getStudentCases(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    const cases = await this.caseService.getCaseByStudentId(
      tokenPayload,
      studentId
    );

    const student = await this.studentService.getStudentByStudentId(studentId);

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentName: student?.fullName,
        studentId: studentId,
        listCases: cases.map((s) => {
          return {
            caseId: s.id,
            caseType: s.type,
            caseName: s.name,
            verificationStatus: s.verificationStatus,
          };
        }),
      } as IStudentCases)
    );
  }

  async getStudentSkills(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    const skills = await this.skillService.getSkillsByStudentId(
      tokenPayload,
      studentId
    );

    const student = await this.studentService.getStudentByStudentId(studentId);

    return res.status(200).json(
      createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
        studentName: student?.fullName,
        studentId: studentId,
        listSkills: skills.map((s) => {
          return {
            skillId: s.id,
            skillType: s.type,
            skillName: s.name,
            verificationStatus: s.verificationStatus,
          };
        }),
      } as IStudentSkills)
    );
  }

  async getCases(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const cases = await this.caseService.getCasesBySupervisor(tokenPayload);

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        cases.map((s) => {
          return {
            latest: s.createdAt,
            studentId: s.Student?.studentId,
            studentName: s.Student?.fullName,
          } as ISubmittedCase;
        })
      )
    );
  }

  async getSkills(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const skills = await this.skillService.getSkillsBySupervisor(tokenPayload);

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        skills.map((s) => {
          return {
            latest: s.createdAt,
            studentId: s.Student?.studentId,
            studentName: s.Student?.fullName,
          } as ISubmittedSkill;
        })
      )
    );
  }

  async postCase(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostCase = req.body;

    try {
      const result = this.validator.validate(CasePayloadSchema, payload);

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

      const testError = await this.caseService.insertNewCase(
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
            "successfully post case"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async postSkill(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPostSkill = req.body;

    try {
      const result = this.skillValidator.validate(SkillPayloadSchema, payload);

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

      const testError = await this.skillService.insertNewSkill(
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
            "successfully post skill"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
