export interface ISubmittedSkill {
  studentName: string;
  latest: Date | string;
  studentId: string;
}

export interface IStudentSkills {
  studentName: string;
  studentId: string;
  listSkills: IListSkillDTO[];
}

export interface IListSkillDTO {
  skillId: string;
  skillName: string;
  skillTypeId: number;
  skillType: "OBSERVED" | "DISCUSSED" | "OBTAINED";
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERFIED";
}
