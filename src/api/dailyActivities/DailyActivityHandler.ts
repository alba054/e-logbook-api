import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { DailyActivityService } from "../../services/database/DailyActivityService";
import { StudentService } from "../../services/database/StudentService";
import { WeekService } from "../../services/database/WeekService";
import { constants, createResponse } from "../../utils";
import {
  IActivitiesDetail,
  IListActivities,
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
  private weekService: WeekService;

  constructor() {
    this.dailyActivityService = new DailyActivityService();
    this.studentService = new StudentService();
    this.weekService = new WeekService();
    this.validator = new Validator();

    this.putDailyActivityActivity = this.putDailyActivityActivity.bind(this);
    this.getSubmittedActivities = this.getSubmittedActivities.bind(this);
    this.getActivitiesOfDailyActivity =
      this.getActivitiesOfDailyActivity.bind(this);
    this.putVerificationStatusOfDailyActivity =
      this.putVerificationStatusOfDailyActivity.bind(this);
    this.putVerificationStatusOfDailyActivities =
      this.putVerificationStatusOfDailyActivities.bind(this);
    this.getActivities = this.getActivities.bind(this);
  }

  async getActivities(req: Request, res: Response, next: NextFunction) {
    const tokenPayload: ITokenPayload = res.locals.user;

    const activities =
      await this.dailyActivityService.getActivitiesBySupervisorId(
        tokenPayload.supervisorId
      );

    return res.status(200).json(
      createResponse(
        constants.SUCCESS_RESPONSE_MESSAGE,
        activities.map((a) => {
          return {
            activityName: a.Activity?.ActivityName?.name,
            activityStatus: a.Activity?.activityStatus,
            id: a.id,
            createdAt: a.createdAt,
            location: a.Activity?.location?.name,
            studentId: a.Student?.studentId,
            studentName: a.Student?.fullName,
            unitName: a.Unit?.name,
            verificationStatus: a.verificationStatus,
            weekNum: a.day?.week?.weekNum,
            day: a.day?.day,
          } as IListActivities;
        })
      )
    );
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

      const weeks = await this.weekService.getWeeksByUnitId(
        student.unitId ?? ""
      );

      const result =
        await this.dailyActivityService.getDailyActivitiesByStudentIdAndUnitId_(
          student.id,
          student.unitId ?? ""
        );

      const weekNums = new Map();

      result.forEach((r) => {
        const weekNum = r.day?.week?.weekNum;
        if (weekNums.has(weekNum)) {
          const activities: any[] = weekNums.get(weekNum);
          activities.push(r);
          weekNums.set(weekNum, activities);
        } else {
          weekNums.set(weekNum, [r]);
        }
      });

      const dailyActivities: { weekNum: number; activities: any }[] = [];

      weekNums.forEach((v, k) => {
        dailyActivities.push({
          weekNum: k,
          activities: v,
        });
      });

      let response = {
        unitName: result[0]?.Unit?.name,
        weeks: weeks.map((w) => {
          return {
            endDate: Number(w.endDate),
            startDate: Number(w.startDate),
            unitId: w.unitId,
            unitName: w.Unit?.name,
            weekName: w.weekNum,
            id: w.id,
            status: w.status,
            days: w.Day.map((d) => {
              return {
                day: d.day,
                id: d.id,
              };
            }),
          };
        }),
        dailyActivities: [],
      } as IStudentDailyActivities;

      if (dailyActivities !== null) {
        response = {
          unitName: result[0]?.Unit?.name,
          weeks: weeks.map((w) => {
            return {
              endDate: Number(w.endDate),
              startDate: Number(w.startDate),
              unitId: w.unitId ?? "",
              status: w.status,
              unitName: w.Unit?.name ?? "",
              weekName: w.weekNum,
              id: w.id,
              days: w.Day.map((d) => {
                return {
                  day: d.day,
                  id: d.id,
                };
              }),
            };
          }),
          dailyActivities: Array.isArray(dailyActivities)
            ? dailyActivities.map((d) => {
                return {
                  weekName: d.weekNum,
                  attendNum: d.activities.filter(
                    (a: any) => a.Activity?.activityStatus === "ATTEND"
                  ).length,
                  notAttendNum: d.activities.filter(
                    (a: any) => a.Activity?.activityStatus === "NOT_ATTEND"
                  ).length,
                  sickNum: d.activities.filter(
                    (a: any) => a.Activity?.activityStatus === "SICK"
                  ).length,
                  activitiesStatus: d.activities?.map((d: any) => {
                    return {
                      id: d.id,
                      day: d.day?.day,
                      location: d.Activity.location?.name,
                      detail: d.Activity?.detail,
                      activityStatus: d.Activity?.activityStatus,
                      activityName: d.Activity.ActivityName?.name,
                      verificationStatus: d.verificationStatus,
                    };
                  }),
                  dailyActivityId: "",
                  verificationStatus: "",
                };
              })
            : [],
        };
      }

      return res
        .status(200)
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, response));
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
    const { dayId } = req.params;
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
        dayId,
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
