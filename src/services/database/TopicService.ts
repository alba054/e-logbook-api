import { Topic } from "../../models/Topic";
import { createErrorObject } from "../../utils";
import { IPostTopicPayload } from "../../utils/interfaces/Topic";

export class TopicService {
  private topicModel: Topic;

  constructor() {
    this.topicModel = new Topic();
  }

  async deleteTopicById(id: number) {
    const topic = await this.topicModel.getTopicById(id);

    if (!topic) {
      return createErrorObject(404, "topic's not found");
    }

    return this.topicModel.deleteTopicById(id);
  }

  async insertTopic(payload: IPostTopicPayload) {
    return this.topicModel.insertNewUnit(payload);
  }

  async getTopics() {
    return this.topicModel.getTopics();
  }
}
