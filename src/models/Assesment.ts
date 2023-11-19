import db from "../database";
import {
  IPutGradeItemMiniCex,
  IPutGradeItemPersonalBehaviourVerificationStatus,
} from "../utils/interfaces/Assesment";
import { ITokenPayload } from "../utils/interfaces/TokenPayload";

export class Assesment {
  async getMiniCexByUnitId(tokenPayload: ITokenPayload, id: string) {
    return db.assesment.findFirst({
      where: {
        unitId: id,
        OR: [
          { studentId: tokenPayload.studentId },
          {
            Student: {
              academicSupervisorId: tokenPayload.supervisorId,
            },
          },
          {
            Student: {
              supervisingSupervisorId: tokenPayload.supervisorId,
            },
          },
          {
            Student: {
              examinerSupervisorId: tokenPayload.supervisorId,
            },
          },
        ],
        NOT: { OR: [{ miniCexId: null }, { miniCexId: undefined }] },
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

  async verifiedOsce(studentId: string, unitId: string, verified: boolean) {
    return db.oSCE.updateMany({
      where: {
        Assesment: {
          Student: {
            studentId,
          },
          unitId,
        },
      },
      data: {
        verified,
      },
    });
  }

  async getAssesmentsByStudentIdAndUnitIdAndType(
    studentId: string | undefined,
    unitId: string | undefined,
    type:
      | "OSCE"
      | "CBT"
      | "PERSONAL_BEHAVIOUR"
      | "MINI_CEX"
      | "SCIENTIFIC_ASSESMENT"
  ) {
    return db.assesment.findFirst({
      where: {
        Student: {
          studentId: studentId === null ? undefined : studentId,
        },
        unitId,
        type,
      },
    });
  }

  async scoreCBT(id: string, score: number) {
    return await db.cBT.update({
      where: {
        id,
      },
      data: {
        score,
      },
    });
  }

  async scoreOSCE(id: string, score: number) {
    return await db.oSCE.update({
      where: {
        id,
      },
      data: {
        score,
      },
    });
  }

  async getAssesmentsByStudentIdAndUnitId(studentId: string, unitId: string) {
    return db.assesment.findMany({
      where: {
        Student: {
          studentId,
        },
        unitId,
      },
      include: {
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
        ScientificAssesment: {
          include: {
            grades: {
              include: {
                gradeItem: true,
              },
            },
          },
        },
        cbt: true,
        osce: true,
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

  async getAssesmentsByStudentId(studentId: string) {
    return db.assesment.findMany({
      where: {
        Student: {
          studentId,
        },
      },
      distinct: ["unitId"],
      select: {
        Unit: true,
        id: true,
        Student: true,
      },
    });
  }

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
            {
              academicSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
            {
              examinerSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
            {
              supervisingSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
          ],
        },
        type: "PERSONAL_BEHAVIOUR",
        PersonalBehaviour: {
          PersonalBehaviourGrade: {
            some: {
              verificationStatus: "INPROCESS",
            },
          },
        },
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
        studentId: studentId === null ? undefined : studentId,
        unitId: unitId === null ? undefined : unitId,
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
        studentId: studentId === null ? undefined : studentId,
        unitId: unitId === null ? undefined : unitId,
        type: "SCIENTIFIC_ASSESMENT",
      },
      include: {
        ScientificAssesment: {
          include: {
            location: true,
          },
        },
      },
    });
  }

  async getScientificAssesmentByUnitId(id: string) {
    return db.assesment.findFirst({
      where: {
        unitId: id,
        NOT: {
          OR: [
            { scientificAssesmentId: null },
            { scientificAssesmentId: undefined },
          ],
        },
      },
      include: {
        Student: true,
        ScientificAssesment: {
          include: {
            location: {
              include: {
                Activity: true,
              },
            },
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

  async getScientificAssesmentById(id: string) {
    return db.assesment.findUnique({
      where: {
        scientificAssesmentId: id,
      },
      include: {
        Student: true,
        ScientificAssesment: {
          include: {
            location: {
              include: {
                Activity: true,
              },
            },
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
    return db.assesment.findFirst({
      where: {
        studentId: studentId === null ? undefined : studentId,
        unitId: unitId === null ? undefined : unitId,
        type: "SCIENTIFIC_ASSESMENT",
      },
      include: {
        Student: true,
        ScientificAssesment: {
          include: {
            location: {
              include: {
                Activity: true,
              },
            },
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

  async getMiniCexAssesmentByStudentIdAndUnitId(
    studentId: string | undefined | null,
    unitId: string | undefined | null
  ) {
    return db.assesment.findMany({
      where: {
        studentId: studentId === null ? undefined : studentId,
        unitId: unitId === null ? undefined : unitId,
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
            {
              academicSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
            {
              examinerSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
            {
              supervisingSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
          ],
        },
        type: "SCIENTIFIC_ASSESMENT",
      },
      include: {
        ScientificAssesment: {
          include: {
            location: true,
          },
        },
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
            {
              academicSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
            {
              examinerSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
            {
              supervisingSupervisorId:
                supervisorId === null ? undefined : supervisorId,
            },
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
