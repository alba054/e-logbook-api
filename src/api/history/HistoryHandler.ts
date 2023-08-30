import { Request, Response, NextFunction } from "express";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { HistoryService } from "../../services/database/HistoryService";
import { constants, createErrorObject, createResponse } from "../../utils";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";

export class HistoryHandler {
  private historyService: HistoryService
  constructor() {
    this.historyService = new HistoryService()
    this.getHistory = this.getHistory.bind(this);
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload: ITokenPayload = res.locals.user;
      let page = parseInt(req.params.page ?? "1");
      let result = undefined;

      if (page != page || page < 1) {
        throw new BadRequestError("bad page");
      }
      
      if (tokenPayload.role == "ER" || tokenPayload.role == "ADMIN") {
        // can see all history
        result = await this.historyService.retrieveHistory(page - 1);
      } else if (tokenPayload.role == "SUPERVISOR" && tokenPayload.supervisorId) {
        // can see own supervisor history
        result = await this.historyService.retrieveHistoryBySupervisors(
          [tokenPayload.supervisorId],
          page - 1
        )
      } else if (tokenPayload.role == "STUDENT" && tokenPayload.studentId) {
        // can see student history
        result = await this.historyService.retrieveHistoryByStudents(
          [tokenPayload.studentId],
          page - 1
        )
      }

      if (!result) {
        throw new InternalServerError()
      } else if (result && "error" in result) {
        switch (result.error) {
          case 400:
            throw new BadRequestError(result.message);
          default:
            throw new InternalServerError(result.message);
        }
      }

      return res
        .status(200)
        .json(createResponse(
          constants.SUCCESS_RESPONSE_MESSAGE,
          result
        ))
    } catch (error) {
      next(error)
    }
  }
}