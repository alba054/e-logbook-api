import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ScientificSession } from "../../models/ScientificSession";
import { createErrorObject } from "../../utils";
import { IPostScientificSessionPayload } from "../../utils/interfaces/ScientificSession";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";

export class ScientificSessionService {
  private studentService: StudentService;
  private scientificSessionModel: ScientificSession;
  constructor() {
    this.scientificSessionModel = new ScientificSession();
    this.studentService = new StudentService();
  }

  async insertNewScientificSession(
    tokenPayload: ITokenPayload,
    payload: IPostScientificSessionPayload
  ) {
    try {
      const studentActiveUnit = await this.studentService.getActiveUnit(
        tokenPayload.studentId ?? ""
      );

      console.log(studentActiveUnit?.activeUnit.activeUnit?.id);

      return this.scientificSessionModel.insertScientificSession(
        payload,
        uuidv4(),
        tokenPayload.studentId,
        studentActiveUnit?.activeUnit.activeUnit?.id
      );
    } catch (error) {
      console.log(error);

      if (error instanceof PrismaClientKnownRequestError) {
        return createErrorObject(
          400,
          "failed to insert new scientific session"
        );
      } else {
        return createErrorObject(500);
      }
    }
  }
}
