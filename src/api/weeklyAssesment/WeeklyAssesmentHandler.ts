import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { DailyActivityService } from "../../services/database/DailyActivityService";
import { StudentService } from "../../services/database/StudentService";
import { WeeklyAssesmentService } from "../../services/database/WeeklyAssesmentService";
import { constants, createResponse } from "../../utils";
import {
  IActivityDetail,
  IStudentWeeklyAssesment,
  IWeeklyAssesment,
} from "../../utils/dto/WeeklyAssesmentDTO";
import { IPutWeeklyAssesmentScore } from "../../utils/interfaces/WeeklyAssesment";
import { AssesmentScoreSchema } from "../../validator/assesment/AssesmentSchema";
import { Validator } from "../../validator/Validator";
import { WeeklyAssesmentScorePayloadSchema } from "../../validator/weeklyAssesment/WeeklyAssesmentSchema";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { WeekService } from "../../services/database/WeekService";
import {
  IDailyActivities,
  IStudentDailyActivities,
} from "../../utils/dto/DailyActiveDTO";

export class WeeklyAssesmentHandler {
  private weeklyAssesmentService: WeeklyAssesmentService;
  private dailyActivityService: DailyActivityService;
  private studentService: StudentService;
  private validator: Validator;
  private weekService: WeekService;

  constructor() {
    this.weeklyAssesmentService = new WeeklyAssesmentService();
    this.dailyActivityService = new DailyActivityService();
    this.studentService = new StudentService();
    this.validator = new Validator();
    this.weekService = new WeekService();

    this.getStudentWeeklyAssesmentsUnit =
      this.getStudentWeeklyAssesmentsUnit.bind(this);
    this.putScoreWeeklyAssesment = this.putScoreWeeklyAssesment.bind(this);
    this.putVerificationStatus = this.putVerificationStatus.bind(this);
  }

  async putVerificationStatus(req: Request, res: Response, next: NextFunction) {
    const { studentId, unitId } = req.params;

    await this.weeklyAssesmentService.verifyWeeklyAssesmentByStudentIdAndUnitId(
      studentId,
      unitId
    );

    return res
      .status(200)
      .json(
        createResponse(
          constants.SUCCESS_RESPONSE_MESSAGE,
          "succesfully verify student weekly assesment"
        )
      );
  }

  async putScoreWeeklyAssesment(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { id } = req.params;
    const tokenPayload: ITokenPayload = res.locals.user;
    const payload: IPutWeeklyAssesmentScore = req.body;

    try {
      const validationResult = this.validator.validate(
        WeeklyAssesmentScorePayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      await this.weeklyAssesmentService.scoreWeelyAssesmentById(
        id,
        payload,
        tokenPayload
      );

      return res
        .status(200)
        .json(
          createResponse(
            constants.SUCCESS_RESPONSE_MESSAGE,
            "succesfully score weekly assesment"
          )
        );
    } catch (error) {
      return next(error);
    }
  }

  async getStudentWeeklyAssesmentsUnit(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { studentId, unitId } = req.params;

      // Get Weekly Assessment by StudentId dan DepartmentId
      const weeklyAssesment =
        await this.weeklyAssesmentService.getWeeklyAssesmentByStudentIdAndUnitId(
          studentId,
          unitId
        );

      // Get Student Detail
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

      // Get Daily Activity by StudentId dan DepartmentId
      const result =
        await this.dailyActivityService.getDailyActivitiesByStudentNimAndUnitId(
          student.id ?? "",
          unitId
        );

      const weeks = await this.weekService.getWeeksByUnitId(
        student?.unitId ?? ""
      );
      const weekIds = new Map();

      // Get WeekNum
      // 1. Get cico
      let checkInTime: number | null;
      let checkOutTime: number | null;
      student?.CheckInCheckOut.forEach((check) => {
        if (check.unitId == student.unitId) {
          checkInTime =
            check.checkInTime != null ? Number(check.checkInTime) : null;
          checkOutTime =
            check.checkOutTime != null ? Number(check.checkOutTime) : null;
          if (checkOutTime !== null) {
            let temp = new Date(checkOutTime * 1000);
            const dayOfWeek = temp.getDay();
            if (dayOfWeek === 1) {
              checkOutTime = temp.getTime() / 1000;
            } else {
              temp = new Date(
                temp.getTime() +
                  7 * 24 * 60 * 60 * 1000 -
                  dayOfWeek * 24 * 60 * 60 * 1000
              );
              checkOutTime = temp.getTime() / 1000;
            }
          }
        }
      });

      result.forEach((r) => {
        const weekId = r.day?.weekId;
        if (weekIds.has(weekId)) {
          const activities: any[] = weekIds.get(weekId);
          activities.push(r);
          weekIds.set(weekId, activities);
        } else {
          weekIds.set(weekId, [r]);
        }
      });

      // INITIAL WEEK
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

      const dailyActivities: { weekId: string; activities: any }[] = [];
      weekIds.forEach((v, k) => {
        dailyActivities.push({
          weekId: k,
          activities: v,
        });
      });

      if (dailyActivities !== null) {
        response = {
          unitName: result[0]?.Unit?.name,
          weeks: weeks.map((w) => {
            return {
              endDate: Number(w.endDate),
              startDate: Number(w.startDate),
              unitId: w.unitId ?? "",
              unitName: w.Unit?.name ?? "",
              weekName: w.weekNum,
              status: w.status,
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
                  weekId: d.weekId,
                  attendNum: d.activities.filter(
                    (a: any) => a.Activity?.activityStatus === "ATTEND"
                  ).length,
                  notAttendNum: d.activities.filter(
                    (a: any) => a.Activity?.activityStatus === "NOT_ATTEND"
                  ).length,
                  sickNum: d.activities.filter(
                    (a: any) => a.Activity?.activityStatus === "SICK"
                  ).length,
                  activitiesStatus: d.activities
                    .filter(
                      (a: any) =>
                        a.Activity !== null &&
                        a.Activity?.activityStatus !== null
                    )
                    .map((d: any) => {
                      return {
                        id: d.id,
                        day: d.day?.day,
                        location: d.Activity?.location?.name,
                        detail: d.Activity?.detail,
                        activityStatus: d.Activity?.activityStatus,
                        activityName: d.Activity?.ActivityName?.name,
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

      let fixWeek = response.weeks
        .filter((w) => {
          return (
            (((checkInTime ?? 0) >= w.startDate &&
              (checkInTime ?? 0) <= w.endDate) ||
              w.startDate >= (checkInTime ?? 0)) &&
            (checkOutTime === null ? true : w.endDate < (checkOutTime ?? 0))
          );
        })
        .map((w, index) => {
          return {
            endDate: w.endDate,
            startDate: w.startDate,
            unitId: w.unitId ?? "",
            unitName: w.unitName,
            weekName: index + 1,
            status: w.status,
            id: w.id,
            days: w.days,
          };
        });

      let fixDailyActivities: IDailyActivities[] = [];
      response.dailyActivities.forEach((activities) => {
        fixWeek.forEach((week) => {
          if (week.id === activities.weekId) {
            fixDailyActivities.push({
              weekId: week.id,
              weekName: week.weekName,
              attendNum: activities.attendNum,
              notAttendNum: activities.notAttendNum,
              sickNum: activities.sickNum,
              activitiesStatus: activities.activitiesStatus,
              dailyActivityId: activities.dailyActivityId,
              verificationStatus: activities.verificationStatus,
            });
          }
        });
      });

      //Add WeekNum ke Weekly Assessment
      let weekNumIndex = 0;
      let listWeeklyAssesment: IWeeklyAssesment[] = [];
      weeklyAssesment.sort((a, b) => a.weekNum - b.weekNum);
      fixWeek.sort((a, b) => a.weekName - b.weekName);
      for (let i = 0; i < weeklyAssesment.length; i++) {
        const w = weeklyAssesment[i];
        let startDate: number = 0;
        let endDate: number = 0;

        if (weekNumIndex < fixWeek.length) {
          startDate = Number(fixWeek[weekNumIndex].startDate);
          endDate = Number(fixWeek[weekNumIndex].endDate);
        }
        let temp = fixDailyActivities.filter(
          (e) => (e.weekId = fixWeek[weekNumIndex].id)
        )[0];
        weekNumIndex++;

        listWeeklyAssesment.push({
          attendNum: temp.attendNum,
          notAttendNum: temp.notAttendNum,
          score: w.score,
          verificationStatus: w.verificationStatus,
          weekNum: i + 1, // Update weekNum index
          id: w.id,
          startDate: startDate,
          endDate: endDate,
        } as IWeeklyAssesment);
      }

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          studentName: weeklyAssesment[0]?.Student?.fullName,
          studentId: weeklyAssesment[0]?.Student?.studentId,
          unitName: weeklyAssesment[0]?.Unit?.name,
          assesments: listWeeklyAssesment,
        } as IStudentWeeklyAssesment)
      );
    } catch (error) {
      return next(error);
    }
  }
}
