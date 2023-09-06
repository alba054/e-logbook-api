export interface IPostSkill {
  readonly type: "OBTAINED" | "DISCUSSED" | "OBSERVED";
  readonly skillTypeId: number;
  readonly supervisorId: string;
}

export interface IPutSkillVerificationStatus {
  readonly verified: boolean;
  readonly rating?: number;
}

export interface IPutSkillsVerificationStatus {
  readonly rating?: number;
}
