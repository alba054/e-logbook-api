export interface IPostSkill {
  readonly type: "OBTAINED" | "DISCUSSED" | "OBSERVED";
  readonly skillTypeId: number;
}

export interface IPutSkillVerificationStatus {
  readonly verified: boolean;
  readonly rating?: number;
}

export interface IPutSkillsVerificationStatus {
  readonly rating?: number;
}
