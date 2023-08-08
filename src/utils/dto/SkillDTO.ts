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

interface IListSkillDTO {
  skillId: string;
  skillName: string;
  skillType: "OBSERVED" | "DISCUSSED" | "OBTAINED";
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERFIED";
}
