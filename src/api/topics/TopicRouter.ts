import { Router } from "express";
import { AuthorizationBearer } from "../../middleware/auth/AuthorizationBearer";
import { constants } from "../../utils";
import { TopicHandler } from "./TopicHandler";

export class TopicRouter {
  private topicHandler: TopicHandler;
  private path: string;
  private router: Router;

  constructor() {
    this.path = "/topics";
    this.router = Router();
    this.topicHandler = new TopicHandler();
  }

  register() {
    // * get all topics
    this.router.get(
      this.path,
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.topicHandler.getTopics
    );
    // * post topics
    this.router.post(
      this.path,
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.topicHandler.postTopic
    );

    // * get topics for each unit
    this.router.get(
      this.path + "/units/:unitId",
      AuthorizationBearer.authorize([
        constants.ADMIN_ROLE,
        constants.STUDENT_ROLE,
        constants.SUPERVISOR_ROLE,
        constants.DPK_ROLE,
      ]),
      this.topicHandler.getTopicsUnit
    );

    // * delete topic
    this.router.delete(
      this.path + "/:id",
      AuthorizationBearer.authorize([constants.ADMIN_ROLE]),
      this.topicHandler.deleteTopic
    );

    return this.router;
  }
}
