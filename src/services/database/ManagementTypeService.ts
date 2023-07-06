import { ManagementType } from "../../models/ManagementType";
import { IPostManagementTypePayload } from "../../utils/interfaces/ManagementType";
import { v4 as uuidv4 } from "uuid";

export class ManagementTypeService {
  private managementTypeModel: ManagementType;

  constructor() {
    this.managementTypeModel = new ManagementType();
  }

  async insertManagementTypesUnit(payload: IPostManagementTypePayload) {
    return this.managementTypeModel.insertManagementTypeByUnitId(
      uuidv4(),
      payload
    );
  }

  async getManagementTypeByUnitId(unitId: string) {
    return this.managementTypeModel.getManagementTypesByUnitId(unitId);
  }
}
