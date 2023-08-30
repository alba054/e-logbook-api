import { Reference } from "../../models/Reference";
import { createErrorObject } from "../../utils";

export class ReferenceService {
  private referenceModel: Reference;

  constructor() {
    this.referenceModel = new Reference();
  }

  async getReferencesByUnit(unitId: string) {
    return this.referenceModel.getReferencesByUnitId(unitId);
  }

  async getReferenceFileById(id: number) {
    const reference = await this.referenceModel.getReferenceById(id);

    if (!reference?.file) {
      return createErrorObject(404, "file's not found");
    }

    return reference.file;
  }

  async getAllReferences() {
    return this.referenceModel.getAllReferences();
  }

  async uploadReferenceByUnitId(savedFile: string, unitId: string) {
    return this.referenceModel.insertReferenceByUnit(savedFile, unitId);
  }
}
