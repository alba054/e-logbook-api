import { DiagnosisType } from "../../models/DiagnosisType";
import { IPostDiagnosisTypePayload } from "../../utils/interfaces/DiagnosisType";
import { v4 as uuidv4 } from "uuid";

export class DiagnosisTypeService {
  private diagnosisTypeModel: DiagnosisType;

  constructor() {
    this.diagnosisTypeModel = new DiagnosisType();
  }

  async insertDiagnosisTypesUnit(payload: IPostDiagnosisTypePayload) {
    return this.diagnosisTypeModel.insertDiagnosisTypeByUnitId(
      uuidv4(),
      payload
    );
  }

  async getDiagnosisTypeByUnitId(unitId: string) {
    return this.diagnosisTypeModel.getDiagnosisTypesByUnitId(unitId);
  }
}
