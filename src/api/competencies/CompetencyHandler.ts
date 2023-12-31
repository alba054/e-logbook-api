import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { CompetencyService } from "../../services/database/CompetencyService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import { IStudentCases, ISubmittedCase } from "../../utils/dto/CaseDTO";
import { ICompetencySubmitted } from "../../utils/dto/CompetencyDTO";
import { IStudentSkills, ISubmittedSkill } from "../../utils/dto/SkillDTO";
import {
  IPostCase,
  IPutCasesVerificationStatus,
  IPutCaseVerificationStatus,
} from "../../utils/interfaces/Case";
import {
  IPostSkill,
  IPutSkillsVerificationStatus,
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
  private validator: Validator;
  private studentService: StudentService;
  private competencyService: CompetencyService;

  constructor() {
    this.skillValidator = new SkillValidator();
    this.competencyService = new CompetencyService();
    this.validator = new Validator();
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
    this.getCompetencies = this.getCompetencies.bind(this);
    this.deleteSkill = this.deleteSkill.bind(this);
    this.deleteCase = this.deleteCase.bind(this);
  }

  async deleteCase(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    try {
      const result = await this.competencyService.deleteCaseById(
        id,
        tokenPayload
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
            "success delete case"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
  async deleteSkill(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    try {
      const result = await this.competencyService.deleteSkillById(
        id,
        tokenPayload
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
            "success delete case"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getCompetencies(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { page, search, name, nim, type } = req.query;

    let competencies: any;
    if (!page) {
      competencies =
        await this.competencyService.getCompetenciesBySupervisorWithoutPage(
          tokenPayload
        );
    } else {
      competencies = await this.competencyService.getCompetenciesBySupervisor(
        tokenPayload,
        parseInt(String(page ?? "1")),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        search,
        name,
        nim,
        type
      );
    }

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        competencies.data.map((c: any) => {
          return {
            competencyType: c.type,
            latest: c.createdAt,
            studentName: c.Student?.fullName,
            studentId: c.Student?.studentId,
            unitName: c.Unit?.name,
            pages:
              Math.ceil(
                competencies.count / constants.HISTORY_ELEMENTS_PER_PAGE
              ) === 0
                ? 1
                : Math.ceil(
                    competencies.count / constants.HISTORY_ELEMENTS_PER_PAGE
                  ),
          } as ICompetencySubmitted;
        })
      )
    );
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

      const result = await this.competencyService.verifyCase(
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
        .json(
          createResponse(constants.SUCCESS_RESPONSE_MESSAGE, "Success verify")
        );
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

      const result = await this.competencyService.verifySkill(
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
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "Success Verify Skills"
          )
        );
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
    const payload: IPutSkillsVerificationStatus = req.body;

    try {
      const result = await this.competencyService.verifyAllStudentSkills(
        tokenPayload,
        studentId,
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
    const payload: IPutCasesVerificationStatus = req.body;

    try {
      const result = await this.competencyService.verifyAllStudentCases(
        tokenPayload,
        studentId,
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
    const { page, search } = req.query;

    let cases: any;

    if (!page) {
      cases = await this.competencyService.getCaseByStudentIdWithoutPage(
        tokenPayload,
        studentId
      );
    } else {
      cases = await this.competencyService.getCaseByStudentId(
        tokenPayload,
        studentId,
        parseInt(String(page ?? "1")),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        search
      );
    }

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

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          studentName: student?.fullName,
          studentId: studentId,
          listCases: cases.data.map((s: any) => {
            return {
              caseId: s.id,
              caseType: s.competencyType,
              caseName: s.case?.name,
              verificationStatus: s.verificationStatus,
              pages:
                Math.ceil(cases.count / constants.HISTORY_ELEMENTS_PER_PAGE) ===
                0
                  ? 1
                  : Math.ceil(
                      cases.count / constants.HISTORY_ELEMENTS_PER_PAGE
                    ),
            };
          }),
        } as IStudentCases)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getStudentSkills(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;
    const { page, search } = req.query;

    let skills: any;

    if (!page) {
      skills = await this.competencyService.getSkillsByStudentIdWithoutPage(
        tokenPayload,
        studentId
      );
    } else {
      skills = await this.competencyService.getSkillsByStudentId(
        tokenPayload,
        studentId,
        parseInt(String(page ?? "1")),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        search
      );
    }

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

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          studentName: student?.fullName,
          studentId: studentId,
          listSkills: skills.data.map((s: any) => {
            return {
              skillId: s.id,
              skillType: s.competencyType,
              skillName: s.skill?.name,
              verificationStatus: s.verificationStatus,
              pages:
                Math.ceil(
                  skills.count / constants.HISTORY_ELEMENTS_PER_PAGE
                ) === 0
                  ? 1
                  : Math.ceil(
                      skills.count / constants.HISTORY_ELEMENTS_PER_PAGE
                    ),
            };
          }),
        } as IStudentSkills)
      );
    } catch (error) {
      return next(error);
    }
  }

  async getCases(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { page, search } = req.query;

    let cases: any;

    if (!page) {
      cases = await this.competencyService.getCasesBySupervisorWithoutPage(
        tokenPayload
      );
    } else {
      cases = await this.competencyService.getCasesBySupervisor(
        tokenPayload,
        parseInt(String(page ?? "1")),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        search
      );
    }

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        cases.data.map((s: any) => {
          return {
            latest: s.createdAt,
            studentId: s.Student?.studentId,
            studentName: s.Student?.fullName,
            unitName: s.Unit?.name,
            pages:
              Math.ceil(cases.count / constants.HISTORY_ELEMENTS_PER_PAGE) === 0
                ? 1
                : Math.ceil(cases.count / constants.HISTORY_ELEMENTS_PER_PAGE),
          } as ISubmittedCase;
        })
      )
    );
  }

  async getSkills(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { page, search } = req.query;

    let skills: any;

    if (!page) {
      skills = await this.competencyService.getSkillsBySupervisorWithoutPage(
        tokenPayload
      );
    } else {
      skills = await this.competencyService.getSkillsBySupervisor(
        tokenPayload,
        parseInt(String(page ?? "1")),
        constants.HISTORY_ELEMENTS_PER_PAGE,
        search
      );
    }

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        skills.data.map((s: any) => {
          return {
            latest: s.createdAt,
            studentId: s.Student?.studentId,
            studentName: s.Student?.fullName,
            unitName: s.Unit?.name,
            pages: Math.ceil(
              skills.count / constants.HISTORY_ELEMENTS_PER_PAGE
            ),
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

      const testError = await this.competencyService.insertNewCase(
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

      const testError = await this.competencyService.insertNewSkill(
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
