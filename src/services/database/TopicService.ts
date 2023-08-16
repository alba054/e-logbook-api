import { Topic } from "../../models/Topic";
import { IPostTopicPayload } from "../../utils/interfaces/Topic";

export class TopicService {
  private topicModel: Topic;

  constructor() {
    this.topicModel = new Topic();
  }

  async insertTopic(payload: IPostTopicPayload) {
    return this.topicModel.insertNewUnit(payload);
  }

  async getTopics() {
    return this.topicModel.getTopics();
  }
}
