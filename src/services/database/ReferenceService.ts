import db from "../../database";
import { Reference } from "../../models/Reference";
import { createErrorObject } from "../../utils";
import { UnitService } from "./UnitService";

export class ReferenceService {
  private referenceModel: Reference;
  private unitService: UnitService;

  constructor() {
    this.referenceModel = new Reference();
    this.unitService = new UnitService();
  }

  async uploadReferenceToAllUnits(savedFile: string) {
    const units = await this.unitService.getAllUnits();

    return db.$transaction(
      units.map((u) => {
        return db.reference.create({
          data: {
            file: savedFile,
            unitId: u.id,
          },
        });
      })
    );
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
