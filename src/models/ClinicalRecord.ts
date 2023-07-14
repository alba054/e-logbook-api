import db from "../database";

export class ClinicalRecord {
  async getClinicalRecordsById(id: string) {
    return db.clinicalRecord.findUnique({
      where: {
        id,
      },
    });
  }

  async getClinicalRecordsBySupervisorId(supervisorId?: string) {
    return db.clinicalRecord.findMany({
      where: {
        supervisorId,
      },
      include: {
        Student: true,
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
      include: {
        Student: true,
      },
    });
  }
}
