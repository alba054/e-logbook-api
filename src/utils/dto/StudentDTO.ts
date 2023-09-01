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
  obtainedCases: number;
  discussedCases: number;
  observedCases: number;
  verifiedCases: number;
  obtainedSkills: number;
  discussedSkills: number;
  observedSkills: number;
  verifiedSkills: number;
  cases: IListCaseDTO[];
  skills: IListSkillDTO[];
}
