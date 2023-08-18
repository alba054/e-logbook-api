import { Router } from "express";
import { DailyActivityHandler } from "./DailyActivityHandler";

export class DailyActivityRouter {
  private path: string;
  private router: Router;
  private handler: DailyActivityHandler;

  constructor() {
    this.path = "/daily-activities";
    this.router = Router();
    this.handler = new DailyActivityHandler();
  }

  register() {
    this.router.route(this.path);

    return this.router;
  }
}
