import { ExaminationType } from "../../models/ExaminationType";
import { IPostExaminationTypePayload } from "../../utils/interfaces/ExaminationType";
import { v4 as uuidv4 } from "uuid";

export class ExaminationTypeService {
  private examinationTypeModel: ExaminationType;

  constructor() {
    this.examinationTypeModel = new ExaminationType();
  }

  async insertExaminationTypesUnit(payload: IPostExaminationTypePayload) {
    return this.examinationTypeModel.insertExaminationTypeByUnitId(
      uuidv4(),
      payload
    );
  }

  async getExaminationTypeByUnitId(unitId: string) {
    return this.examinationTypeModel.getExaminationTypesByUnitId(unitId);
  }
}
