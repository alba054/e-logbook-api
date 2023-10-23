import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { DailyActivityService } from "../../services/database/DailyActivityService";
import { StudentService } from "../../services/database/StudentService";
import { WeeklyAssesmentService } from "../../services/database/WeeklyAssesmentService";
import { constants, createResponse } from "../../utils";
import { IStudentWeeklyAssesment, IWeeklyAssesment } from "../../utils/dto/WeeklyAssesmentDTO";
import { IPutWeeklyAssesmentScore } from "../../utils/interfaces/WeeklyAssesment";
import { AssesmentScoreSchema } from "../../validator/assesment/AssesmentSchema";
import { Validator } from "../../validator/Validator";
import { WeeklyAssesmentScorePayloadSchema } from "../../validator/weeklyAssesment/WeeklyAssesmentSchema";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { WeekService } from "../../services/database/WeekService";

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

      await this.weeklyAssesmentService.scoreWeelyAssesmentById(id, payload, tokenPayload);

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

      let listWeeklyAssesment : IWeeklyAssesment[] = [];
      for(const w of weeklyAssesment){
        const student = await this.studentService.getStudentById(w.Student?.id ?? '');
        let checkInTime: number | null;
        let checkOutTime: number | null;

        student?.CheckInCheckOut.forEach((check) => {
          if(check.unitId == student.unitId){
            checkInTime = check.checkInTime != null ? Number(check.checkInTime) : null;
            checkOutTime = check.checkOutTime != null ? Number(check.checkOutTime) : null;
          }
        });
        const weeks = await this.weekService.getWeeksByUnitId(
         student?.unitId ?? ""
        );

        let fixWeek = weeks.filter((w)=>{
          return (w.startDate)>=(checkInTime??0) && checkOutTime===null ? true: w.endDate<=(checkOutTime??0);
        });

        let startDate: number | null = null;
        let endDate: number | null = null;
        let weekNum : number = 0;
        fixWeek.forEach((wd, index)=>{
          if(w.weekId===wd.id){
            weekNum = index+1;
            startDate = Number(wd.startDate);
            endDate = Number(wd.endDate);
          }
        });  
        listWeeklyAssesment.push({
              attendNum: dailyActivities
                .filter((a) => a.day?.week?.id === w.weekId)
                .filter((a) => a.Activity?.activityStatus === "ATTEND").length,
              notAttendNum: dailyActivities
                .filter((a) => a.day?.week?.id === w.weekId)
                .filter(
                  (a) =>
                    a.Activity?.activityStatus === "NOT_ATTEND" ||
                    a.Activity?.activityStatus === "SICK" ||
                    a.Activity?.activityStatus === "HOLIDAY"
                ).length,
              score: w.score,
              verificationStatus: w.verificationStatus,
              weekNum: weekNum,
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
