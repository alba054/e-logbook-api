import db from "../database";
import {
  IPutGradeItemMiniCex,
  IPutGradeItemPersonalBehaviourVerificationStatus,
} from "../utils/interfaces/Assesment";

export class Assesment {
  async verifyPersonalBehaviourGradeItemVerificationStatus(
    payload: IPutGradeItemPersonalBehaviourVerificationStatus
  ) {
    return db.personalBehaviourGrade.update({
      where: {
        id: payload.id,
      },
      data: {
        verificationStatus: payload.verified ? "VERIFIED" : "UNVERIFIED",
      },
    });
  }

  async getPersonalBehaviourById(id: string) {
    return db.assesment.findUnique({
      where: {
        personalBehaviourId: id,
      },
      include: {
        Student: true,
        PersonalBehaviour: {
          include: {
            PersonalBehaviourGrade: {
              include: {
                gradeItem: true,
              },
            },
          },
        },
      },
    });
  }

  async getPersonalBehavioursByStudentIdAndSupervisorId(
    studentId: string,
    supervisorId: string | undefined
  ) {
    return db.assesment.findMany({
      where: {
        Student: {
          studentId,
          OR: [
            { academicSupervisorId: supervisorId },
            { examinerSupervisorId: supervisorId },
            { supervisingSupervisorId: supervisorId },
          ],
        },
        type: "PERSONAL_BEHAVIOUR",
      },
      include: {
        PersonalBehaviour: true,
        Student: true,
      },
    });
  }

  async getPersonalBehaviourByStudentIdAndUnitId(
    studentId: string | null | undefined,
    unitId: string | null | undefined
  ) {
    return db.assesment.findMany({
      where: {
        studentId,
        unitId,
        type: "PERSONAL_BEHAVIOUR",
      },
    });
  }

  async getScientificAssesmentsByStudentIdAndUnitId(
    studentId: string | undefined | null,
    unitId: string | undefined | null
  ) {
    return db.assesment.findMany({
      where: {
        studentId,
        unitId,
        type: "SCIENTIFIC_ASSESMENT",
      },
      include: {
        ScientificAssesment: true,
      },
    });
  }

  async getScientificAssesmentById(id: string) {
    return db.assesment.findUnique({
      where: {
        scientificAssesmentId: id,
      },
      include: {
        Student: true,
        ScientificAssesment: {
          include: {
            grades: {
              include: {
                gradeItem: true,
              },
            },
          },
        },
      },
    });
  }

  async getScientificAssesmentByStudentIdAndUnitId(
    studentId: string | null,
    unitId: string | null
  ) {
    return db.assesment.findMany({
      where: {
        studentId,
        unitId,
        type: "SCIENTIFIC_ASSESMENT",
      },
    });
  }

  async getMiniCexAssesmentByStudentIdAndUnitId(
    studentId: string | undefined | null,
    unitId: string | undefined | null
  ) {
    return db.assesment.findMany({
      where: {
        studentId,
        unitId,
        type: "MINI_CEX",
      },
      include: {
        MiniCex: {
          include: {
            location: true,
          },
        },
      },
    });
  }

  async insertGradeItemMiniCex(id: string, payload: IPutGradeItemMiniCex) {
    return db.miniCex.update({
      where: {
        id,
      },
      data: {
        MiniCexGrade: {
          create: {
            name: payload.name,
          },
        },
      },
    });
  }

  async getMiniCexById(id: string) {
    return db.assesment.findUnique({
      where: {
        miniCexId: id,
      },
      include: {
        Student: true,
        MiniCex: {
          include: {
            location: true,
            MiniCexGrade: {
              include: {
                gradeItem: true,
              },
            },
          },
        },
      },
    });
  }

  async getScientificAssesmentByStudentIdAndSupervisorId(
    studentId: string,
    supervisorId: string | undefined
  ) {
    return db.assesment.findMany({
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
