import { SelfReflection } from "../../models/SelfReflection";
import { IPostSelfReflection } from "../../utils/interfaces/SelfReflection";
import { ITokenPayload } from "../../utils/interfaces/TokenPayload";
import { v4 as uuidv4 } from "uuid";
import { StudentService } from "./StudentService";

export class SelfReflectionService {
  private selfReflectionModel: SelfReflection;
  private studentService: StudentService;

  constructor() {
    this.selfReflectionModel = new SelfReflection();
    this.studentService = new StudentService();
  }

  async getSelfReflectionsByStudentAndUnitId(tokenPayload: ITokenPayload) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    const selfReflections =
      await this.selfReflectionModel.getSelfReflectionsByStudentIdAndUnitId(
        tokenPayload.studentId,
        activeUnit?.activeUnit.activeUnit?.id
      );

    return selfReflections;
  }

  async insertNewSelfReflection(
    tokenPayload: ITokenPayload,
    payload: IPostSelfReflection
  ) {
    const activeUnit = await this.studentService.getActiveUnit(
      tokenPayload.studentId ?? ""
    );

    return this.selfReflectionModel.insertSelfReflection(
      uuidv4(),
      payload,
      tokenPayload.studentId,
      activeUnit?.activeUnit.activeUnit?.id
    );
  }
}
