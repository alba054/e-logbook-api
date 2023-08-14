export interface ICompetencySubmitted {
  studentName: string;
  latest: Date | string;
  competencyType: "CASE" | "SKILL";
}
