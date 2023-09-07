export interface ISubmittedSkill {
  studentName: string;
  latest: Date | string;
  studentId: string;
  unitName?: string;
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
  skillType: "OBSERVER" | "PERFORM";
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERFIED";
}
