import { NextFunction, Request, Response } from "express";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";

export class UnitCheckIn {
  checkCheckInStatus() {
    return function async(req: Request, res: Response, next: NextFunction) {
      const { unitId } = req.body;

      try {
        if (!unitId) {
          throw new BadRequestError("unit id is not defined");
        }
      } catch (error) {
        return next(error);
      }
    };
  }
}
