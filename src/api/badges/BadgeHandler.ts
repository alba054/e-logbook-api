import { NextFunction, Request, Response } from "express";
import { BadgeService } from "../../services/database/BadgeService";
import { constants, createResponse } from "../../utils";

export class BadgeHandler {
  private badgeService: BadgeService;

  constructor() {
    this.badgeService = new BadgeService();

    this.getBadges = this.getBadges.bind(this);
  }

  async getBadges(req: Request, res: Response, next: NextFunction) {
    const badges = await this.badgeService.getAllBadges();

    return res
      .status(200)
      .json(createResponse(constants.SUCCESS_RESPONSE_MESSAGE, badges));
  }
}
