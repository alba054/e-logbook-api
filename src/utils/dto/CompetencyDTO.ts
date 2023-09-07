export interface ICompetencySubmitted {
  studentName: string;
  studentId: string;
  latest: Date | string;
  competencyType: "CASE" | "SKILL";
  unitName?: string;
}
