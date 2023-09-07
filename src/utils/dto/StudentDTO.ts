import { IListCaseDTO } from "./CaseDTO";
import { IListSkillDTO } from "./SkillDTO";

export interface IListSupervisorStudent {
  studentName: string;
  studentId: string;
  id: string;
  activeUnitId: string;
  activeUnitName: string;
  userId?: string;
}

export interface IStudentStastic {
  finalScore: number;
  totalCases: number;
  totalSkills: number;
  verifiedCases: number;
  verifiedSkills: number;
  cases: IListCaseDTO[];
  skills: IListSkillDTO[];
}
