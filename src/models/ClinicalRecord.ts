import db from "../database";

export class ClinicalRecord {
  async getClinicalRecordsBySupervisorId(supervisorId?: string) {
    return db.clinicalRecord.findMany({
      where: {
        supervisorId,
      },
    });
  }

  async getClinicalRecordsByStatusAndSupervisorId(
    status: any,
    supervisorId?: string
  ) {
    return db.clinicalRecord.findMany({
      where: {
        verificationStatus: status,
        supervisorId,
      },
    });
  }
}
