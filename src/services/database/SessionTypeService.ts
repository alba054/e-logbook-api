import { SessionType } from "../../models/SessionType";
import { IPostSessionTypePayload } from "../../utils/interfaces/SessionType";

export class SessionTypeService {
  private sessionTypeModel: SessionType;

  constructor() {
    this.sessionTypeModel = new SessionType();
  }

  async deleteSessionTypeById(id: number) {
    return this.sessionTypeModel.deleteSessionType(id);
  }

  async insertSessionType(payload: IPostSessionTypePayload) {
    return this.sessionTypeModel.insertSessionType(payload);
  }

  async getSessionTypes() {
    return this.sessionTypeModel.getSessionTypes();
  }
}
