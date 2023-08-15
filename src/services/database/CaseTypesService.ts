import { CaseTypes } from "../../models/CaseTypes";
import { IPostCaseTypesPayload } from "../../utils/interfaces/CaseTypes";

export class CaseTypesService {
  private caseTypesModel: CaseTypes;

  constructor() {
    this.caseTypesModel = new CaseTypes();
  }

  async deleteCaseTypesById(id: number) {
    return this.caseTypesModel.deleteCaseTypes(id);
  }

  async insertCaseTypesUnit(payload: IPostCaseTypesPayload) {
    return this.caseTypesModel.insertCaseTypesByUnitId(payload);
  }

  async getCaseTypesByUnitId(unitId: string) {
    return this.caseTypesModel.getCaseTypesByUnitId(unitId);
  }
}
