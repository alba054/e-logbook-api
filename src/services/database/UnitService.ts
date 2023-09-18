import { Unit } from "../../models/Unit";
import { createErrorObject } from "../../utils";
import { IPostUnit } from "../../utils/interfaces/Unit";
import { v4 as uuidv4 } from "uuid";

export class UnitService {
  private unitModel: Unit;
  constructor() {
    this.unitModel = new Unit();
  }

  async deleteUnitById(id: string) {
    const unit = await this.unitModel.getUnitById(id);

    if (!unit) {
      return createErrorObject(404, "unit's not found");
    }

    return this.unitModel.deleteById(id);
  }

  async insertNewUnit(payload: IPostUnit) {
    const id = uuidv4();

    return this.unitModel.insertNewUnit(id, payload);
  }

  async getAllUnits() {
    return this.unitModel.getAllUnits();
  }
}
