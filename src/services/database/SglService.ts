import { Sgl } from "../../models/Sgl";
import { IPostSGL } from "../../utils/interfaces/Sgl";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { StudentService } from "./StudentService";
import { v4 as uuidv4 } from "uuid";

export class SglService {
  private studentService: StudentService;
  private sglModel: Sgl;

  constructor() {
    this.studentService = new StudentService();
    this.sglModel = new Sgl();
  }

  async getSglsBySupervisorAndStudentId(
    tokenPayload: ITokenPayload,
    studentId: string
  ) {
    return this.sglModel.getSglsBySupervisorIdAndStudentId(
      tokenPayload.supervisorId,
      studentId
    );
  }

  async getSglsBySupervisor(tokenPayload: ITokenPayload) {
    return this.sglModel.getSglsBySupervisorId(tokenPayload.supervisorId);
  }

  async insertNewSgl(tokenPayload: ITokenPayload, payload: IPostSGL) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.sglModel.insertSgl(
      uuidv4(),
      uuidv4(),
      payload,
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }
}
