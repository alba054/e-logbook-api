import { Request, Response, NextFunction } from "express";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { HistoryService } from "../../services/database/HistoryService";
import { constants, createErrorObject, createResponse } from "../../utils";
import { BadRequestError } from "../../exceptions/httpError/BadRequestError";
import { InternalServerError } from "../../exceptions/httpError/InternalServerError";

export class HistoryHandler {
  private historyService: HistoryService;
  constructor() {
    this.historyService = new HistoryService();
    this.getHistory = this.getHistory.bind(this);
  }

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const tokenPayload: ITokenPayload = res.locals.user;
      let page = parseInt(req.params.page ?? "1");
      const { checkIn } = req.query;
      let result = undefined;

      if (page != page || page < 1) {
        throw new BadRequestError("bad page");
      }

      if (
        tokenPayload.role == "ADMIN"
      ) {
        // can see all history
        result = await this.historyService.retrieveHistory(
          page - 1,
          constants.HISTORY_ELEMENTS_PER_PAGE,
          checkIn
        );
      } else if (tokenPayload.role == "ER"){
        result = await this.historyService.retrieveHistoryEr(
          page - 1,
          constants.HISTORY_ELEMENTS_PER_PAGE,
          checkIn
        );
      } 
      else if (
        tokenPayload.role == "SUPERVISOR" &&
        tokenPayload.supervisorId
      ) {
        if(tokenPayload.badges?.includes("HEAD_DIV") && tokenPayload.badges?.includes("CEU")){
          result = await this.historyService.retrieveHistoryBySupervisorCeu(
            [tokenPayload.supervisorId],
            page - 1,
            constants.HISTORY_ELEMENTS_PER_PAGE,
            true
          );
        }
        else if(tokenPayload.badges?.includes("HEAD_DIV")){
          result = await this.historyService.retrieveHistoryBySupervisors(
            [tokenPayload.supervisorId],
            page - 1,
            constants.HISTORY_ELEMENTS_PER_PAGE,
            true
          );
        }
        else if(tokenPayload.badges?.includes("CEU")){
          result = await this.historyService.retrieveHistoryBySupervisorCeu(
            [tokenPayload.supervisorId],
            page - 1,
            constants.HISTORY_ELEMENTS_PER_PAGE,
            false
          );
        }else{
          result = await this.historyService.retrieveHistoryBySupervisors(
          [tokenPayload.supervisorId],
          page - 1,
          constants.HISTORY_ELEMENTS_PER_PAGE,
          false
        );
        }
        
      } else if (tokenPayload.role == "STUDENT" && tokenPayload.studentId) {
        // can see student history
        result = await this.historyService.retrieveHistoryByStudents(
          [tokenPayload.studentId],
          page - 1,
          constants.HISTORY_ELEMENTS_PER_PAGE,
          checkIn
        );
      }

      if (!result) {
        throw new InternalServerError();
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
        .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, result));
    } catch (error) {
      next(error);
    }
  }
}
