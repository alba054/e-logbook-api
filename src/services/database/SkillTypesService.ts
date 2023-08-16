import { SkillTypes } from "../../models/SkillTypes";
import { IPostSkillTypesPayload } from "../../utils/interfaces/SkillTypes";

export class SkillTypesService {
  private skillTypesModel: SkillTypes;

  constructor() {
    this.skillTypesModel = new SkillTypes();
  }

  async deleteSkillTypesById(id: number) {
    return this.skillTypesModel.deleteSkillTypes(id);
  }

  async insertSkillTypesUnit(payload: IPostSkillTypesPayload) {
    return this.skillTypesModel.insertSkillTypesByUnitId(payload);
  }

  async getSkillTypesByUnitId(unitId: string) {
    return this.skillTypesModel.getSkillTypesByUnitId(unitId);
  }
}
