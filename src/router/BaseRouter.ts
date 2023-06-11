import express, { Router } from "express";

export class BaseRouter {
  path: string;
  router: express.Router;

  constructor(path: string) {
    this.path = path;
    this.router = express.Router();
  }

  register(router: Router) {
    router.use(this.path, this.router);

    return router;
  }
}
