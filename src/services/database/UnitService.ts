import { Unit } from "../../models/Unit";
import { IPostUnit } from "../../utils/interfaces/Unit";
import { v4 as uuidv4 } from "uuid";

export class UnitService {
  private unitModel: Unit;
  constructor() {
    this.unitModel = new Unit();
  }

  async insertNewUnit(payload: IPostUnit) {
    const id = uuidv4();

    return this.unitModel.insertNewUnit(id, payload);
  }

  async getAllUnits() {
    return this.unitModel.getAllUnits();
  }
}
