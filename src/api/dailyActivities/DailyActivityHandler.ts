import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { DailyActivityService } from "../../services/database/DailyActivityService";
import { StudentService } from "../../services/database/StudentService";
import { constants, createResponse } from "../../utils";
import {
  IActivitiesDetail,
  IListActivitiesPerWeek,
  IStudentDailyActivities,
} from "../../utils/dto/DailyActiveDTO";
import {
  IPutDailyActivityActivity,
  IPutDailyActivityVerificationStatus,
} from "../../utils/interfaces/DailyActivity";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import {
  DailyActivityActivityPayloadSchema,
  DailyActivityVerificationStatusSchema,
} from "../../validator/dailyActivities/DailyActivitySchema";
import { Validator } from "../../validator/Validator";

export class DailyActivityHandler {
  private dailyActivityService: DailyActivityService;
  private validator: Validator;
  private studentService: StudentService;

  constructor() {
    this.dailyActivityService = new DailyActivityService();
    this.studentService = new StudentService();
    this.validator = new Validator();

    this.putDailyActivityActivity = this.putDailyActivityActivity.bind(this);
    this.getSubmittedActivities = this.getSubmittedActivities.bind(this);
    this.getActivitiesOfDailyActivity =
      this.getActivitiesOfDailyActivity.bind(this);
    this.putVerificationStatusOfDailyActivity =
      this.putVerificationStatusOfDailyActivity.bind(this);
    this.putVerificationStatusOfDailyActivities =
      this.putVerificationStatusOfDailyActivities.bind(this);
  }

  async putVerificationStatusOfDailyActivities(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutDailyActivityVerificationStatus = req.body;
    const { studentId } = req.params;

    try {
      const validationResult = this.validator.validate(
        DailyActivityVerificationStatusSchema,
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

      const result = await this.dailyActivityService.verifyDailyActivities(
        studentId,
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

  async putVerificationStatusOfDailyActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutDailyActivityVerificationStatus = req.body;
    const { id } = req.params;

    try {
      const validationResult = this.validator.validate(
        DailyActivityVerificationStatusSchema,
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

      const result = await this.dailyActivityService.verifyDailyActivity(
        id,
        tokenPayload,
        payload
      );

      // if (result && "error" in result) {
      //   switch (result.error) {
      //     case 400:
      //       throw new BadRequestError(result.message);
      //     case 404:
      //       throw new NotFoundError(result.message);
      //     default:
      //       throw new InternalServerError();
      //   }
      // }

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, result));
    } catch (error) {
      return next(error);
    }
  }

  async getActivitiesOfDailyActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;

    try {
      const result =
        await this.dailyActivityService.getActivitiesByDailyActivityId(
          tokenPayload,
          id
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

      // return res.status(200).json(
      //   createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
      //     alpha: result.activities.filter((a) => a.activityStatus !== "ATTEND")
      //       .length,
      //     attend: result.activities.filter((a) => a.activityStatus === "ATTEND")
      //       .length,
      //     weekName: result.weekNum,
      //     verificationStatus: result.verificationStatus,
      //     activities: result.activities.map((a) => {
      //       return {
      //         activityStatus: a.activityStatus,
      //         day: a.day,
      //         verificationStatus: a.verificationStatus,
      //         activityName: a.ActivityName?.name,
      //         detail: a.detail,
      //         location: a.location?.name,
      //       } as IActivitiesDetail;
      //     }),
      //   } as IListActivitiesPerWeek)
      // );
    } catch (error) {
      return next(error);
    }
  }

  async getSubmittedActivities(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { studentId } = req.params;

    try {
      const activities =
        await this.dailyActivityService.getActivitiesByStudentId(
          tokenPayload,
          studentId
        );

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
      // return res.status(200).json(
      //   createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
      //     unitName: activities[0]?.Unit?.name,
      //     dailyActivities: activities.map((r) => {
      //       return {
      //         verificationStatus: r.verificationStatus,
      //         weekName: r.weekNum,
      //         dailyActivityId: r.id,
      //         attendNum: r.activities.filter(
      //           (a) => a.activityStatus === "ATTEND"
      //         ).length,
      //         notAttendNum: r.activities.filter(
      //           (a) => a.activityStatus === "NOT_ATTEND"
      //         ).length,
      //         sickNum: r.activities.filter((a) => a.activityStatus === "SICK")
      //           .length,
      //         activitiesStatus: r.activities.map((a) => {
      //           return {
      //             activityStatus: a.activityStatus,
      //             day: a.day,
      //             verificationStatus: a.verificationStatus,
      //             activityName: a.ActivityName?.name,
      //             location: a.location?.name,
      //             detail: a.detail,
      //           } as IActivitiesDetail;
      //         }),
      //       };
      //     }),
      //   } as IStudentDailyActivities)
      // );
    } catch (error) {
      return next(error);
    }
  }

  async putDailyActivityActivity(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tokenPayload: ITokenPayload = res.locals.user;
    const { id } = req.params;
    const payload: IPutDailyActivityActivity = req.body;

    try {
      const validationResult = this.validator.validate(
        DailyActivityActivityPayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      const result = await this.dailyActivityService.editDailyActivityActivity(
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
            "successfully fill daily activity"
          )
        );
    } catch (error) {
      return next(error);
    }
  }
}
