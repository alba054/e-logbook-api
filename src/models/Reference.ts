import db from "../database";

export class Reference {
  async getReferencesByUnitId(unitId: string) {
    return db.reference.findMany({
      where: {
        unitId,
      },
    });
  }

  async getReferenceById(id: number) {
    return db.reference.findUnique({
      where: {
        id,
      },
    });
  }

  async getAllReferences() {
    return db.reference.findMany();
  }

  async insertReferenceByUnit(savedFile: string, unitId: string) {
    return db.reference.create({
      data: {
        file: savedFile,
        unitId,
      },
    });
  }
}