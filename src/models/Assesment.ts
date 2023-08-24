import db from "../database";

export class Assesment {
  async getScientificAssesmentByStudentIdAndSupervisorId(
    studentId: string,
    supervisorId: string | undefined
  ) {
    return db.assesment.findFirst({
      where: {
        Student: {
          studentId,
          OR: [
            { academicSupervisorId: supervisorId },
            { examinerSupervisorId: supervisorId },
            { supervisingSupervisorId: supervisorId },
          ],
        },
        type: "SCIENTIFIC_ASSESMENT",
      },
      include: {
        ScientificAssesment: true,
        Student: true,
      },
    });
  }

  async getMiniCexAssesmentByStudentIdAndSupervisorId(
    studentId: string,
    supervisorId: string | undefined
  ) {
    return db.assesment.findFirst({
      where: {
        Student: {
          studentId,
          OR: [
            { academicSupervisorId: supervisorId },
            { examinerSupervisorId: supervisorId },
            { supervisingSupervisorId: supervisorId },
          ],
        },
        type: "MINI_CEX",
      },
      include: {
        MiniCex: {
          include: {
            location: true,
          },
        },
        Student: true,
      },
    });
  }
}
