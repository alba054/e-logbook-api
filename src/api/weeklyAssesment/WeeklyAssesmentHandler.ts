import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { DailyActivityService } from "../../services/database/DailyActivityService";
import { StudentService } from "../../services/database/StudentService";
import { WeeklyAssesmentService } from "../../services/database/WeeklyAssesmentService";
import { constants, createResponse } from "../../utils";
import { IStudentWeeklyAssesment } from "../../utils/dto/WeeklyAssesmentDTO";
import { IPutWeeklyAssesmentScore } from "../../utils/interfaces/WeeklyAssesment";
import { AssesmentScoreSchema } from "../../validator/assesment/AssesmentSchema";
import { Validator } from "../../validator/Validator";
import { WeeklyAssesmentScorePayloadSchema } from "../../validator/weeklyAssesment/WeeklyAssesmentSchema";

export class WeeklyAssesmentHandler {
  private weeklyAssesmentService: WeeklyAssesmentService;
  private dailyActivityService: DailyActivityService;
  private studentService: StudentService;
  private validator: Validator;

  constructor() {
    this.weeklyAssesmentService = new WeeklyAssesmentService();
    this.dailyActivityService = new DailyActivityService();
    this.studentService = new StudentService();
    this.validator = new Validator();

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
    const payload: IPutWeeklyAssesmentScore = req.body;

    try {
      const validationResult = this.validator.validate(
        WeeklyAssesmentScorePayloadSchema,
        payload
      );

      if (validationResult && "error" in validationResult) {
        throw new BadRequestError(validationResult.message);
      }

      await this.weeklyAssesmentService.scoreWeelyAssesmentById(id, payload);

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

      const weeklyAssesment =
        await this.weeklyAssesmentService.getWeeklyAssesmentByStudentIdAndUnitId(
          studentId,
          unitId
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

      const dailyActivities =
        await this.dailyActivityService.getDailyActivitiesByStudentNimAndUnitId(
          student.id ?? "",
          unitId
        );

      return res.status(200).json(
        createResponse(constants.SUCCESS_RESPONSE_MESSAGE, {
          studentName: weeklyAssesment[0]?.Student?.fullName,
          studentId: weeklyAssesment[0]?.Student?.studentId,
          assesments: weeklyAssesment.map((w) => {
            return {
              attendNum: dailyActivities
                .find((a) => a.weekNum === w.weekNum)
                ?.activities.filter((a) => a.activityStatus === "ATTEND")
                .length,
              notAttendNum: dailyActivities
                .find((a) => a.weekNum === w.weekNum)
                ?.activities.filter(
                  (a) =>
                    a.activityStatus === "NOT_ATTEND" ||
                    a.activityStatus === "SICK"
                ).length,
              score: w.score,
              verificationStatus: w.verificationStatus,
              weekNum: w.weekNum,
              id: w.id,
            };
          }),
        } as IStudentWeeklyAssesment)
      );
    } catch (error) {
      return next(error);
    }
  }
}
