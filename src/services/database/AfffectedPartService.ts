import { AffectedPart } from "../../models/AffectedPart";
import { IPostAffectedPartPayload } from "../../utils/interfaces/AffectedPart";
import { v4 as uuidv4 } from "uuid";

export class AffectedPartService {
  private affectedPartModel: AffectedPart;

  constructor() {
    this.affectedPartModel = new AffectedPart();
  }

  async deleteAffectedPartById(id: string) {
    return this.affectedPartModel.deleteAffectedPart(id);
  }

  async insertAffectedPartsUnit(payload: IPostAffectedPartPayload) {
    return this.affectedPartModel.insertAffectedPartByUnitId(uuidv4(), payload);
  }

  async getAffectedPartsByUnitId(unitId: string) {
    return this.affectedPartModel.getAffectedPartsByUnitId(unitId);
  }
}
