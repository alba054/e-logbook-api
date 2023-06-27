import { NextFunction, Request, Response } from "express";
import { StudentService } from "../../services/database/StudentService";
import { CheckInCheckOutService } from "../../services/database/CheckInCheckOutService";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { NotFoundError } from "../../exceptions/httpError/NotFoundError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";

export class UnitCheckIn {
  private static checkCheckInStatus() {
    return async function (req: Request, res: Response, next: NextFunction) {
      const { studentId } = res.locals.user as ITokenPayload;

      try {
        if (!studentId) {
          throw new InternalServerError();
        }

        const studentService = new StudentService();
        const studentActiveUnit = await studentService.getActiveUnit(studentId);

        const checkInCheckOutService = new CheckInCheckOutService();
        const checkedIn =
          await checkInCheckOutService.getCheckInCheckOutByUnitIdAndStudentId(
            studentId,
            studentActiveUnit?.activeUnit.activeUnit?.id
          );

        if (checkedIn && "error" in checkedIn) {
          switch (checkedIn.error) {
            case 400:
              throw new BadRequestError(checkedIn.message);
            case 404:
              throw new NotFoundError(checkedIn.message);
            default:
              throw new InternalServerError();
          }
        }

        res.locals.checkedIn = checkedIn;

        next();
      } catch (error) {
        return next(error);
      }
    };
  }

  static restrictUnitActiveChanges() {
    return function (req: Request, res: Response, next: NextFunction) {
      UnitCheckIn.checkCheckInStatus()(req, res, () => {
        const { checkedIn } = res.locals;
        try {
          if (
            checkedIn &&
            checkedIn.checkIn &&
            checkedIn.checkInStatus !== "UNVERIFIED" &&
            !checkedIn.checkOut
          ) {
            throw new BadRequestError("active unit has been checked in");
          }

          return next();
        } catch (error) {
          return next(error);
        }
      });
    };
  }

  static restrictUncheckInActiveUnit() {
    return function (req: Request, res: Response, next: NextFunction) {
      UnitCheckIn.checkCheckInStatus()(req, res, () => {
        const { checkedIn } = res.locals;

        try {
          if (!checkedIn) {
            throw new BadRequestError(
              "there is no active unit has been checkedin"
            );
          }

          if (
            checkedIn.checkIn &&
            checkedIn.checkInStatus === "VERIFIED" &&
            !checkedIn.checkOut
          ) {
            return next();
          }

          throw new BadRequestError(
            "active unit has not been checked in cannot access unit activity"
          );
        } catch (error) {
          return next(error);
        }
      });
    };
  }
}
