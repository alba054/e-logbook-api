import db from "../../database";
import { v4 as uuidv4 } from "uuid";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { Assesment } from "../../models/Assesment";
import { createErrorObject } from "../../utils";
import { IPostMiniCex } from "../../utils/interfaces/Assesment";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export class AssesmentService {
  private studentService: StudentService;
  private assesmentModel: Assesment;

  constructor() {
    this.assesmentModel = new Assesment();
    this.studentService = new StudentService();
  }

  async getScientificAssesmentByStudentId(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    const scientificAssesment =
      await this.assesmentModel.getScientificAssesmentByStudentIdAndSupervisorId(
        studentId,
        tokenPayload.supervisorId
      );

    return scientificAssesment;
  }

  async addMiniCexAssesment(
    tokenPayload: ITokenPayload,
    payload: IPostMiniCex
  ) {
    try {
      const activeUnit = await this.studentService.getActiveUnit(
        tokenPayload.studentId ?? ""
      );
      const miniCexId = uuidv4();

      return db.$transaction([
        db.miniCex.create({
          data: {
            id: miniCexId,
            activityLocationId: payload.location,
            case: payload.case,
          },
        }),
        db.assesment.create({
          data: {
            id: uuidv4(),
            type: "MINI_CEX",
            studentId: tokenPayload.studentId,
            unitId: activeUnit?.activeUnit.activeUnit?.id,
            miniCexId,
          },
        }),
      ]);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(400, "failed to add mini cex assesment");
      } else {
        return createErrorObject(500);
      }
    }
  }

  async getMiniCexsByStudentId(tokenPayload: ITokenPayload, studentId: string) {
    const miniCexs =
      await this.assesmentModel.getMiniCexAssesmentByStudentIdAndSupervisorId(
        studentId,
        tokenPayload.supervisorId
      );

    return miniCexs;
  }
}
