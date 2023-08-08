export interface IPostSkill {
  readonly name: string;
  readonly type: "OBTAINED" | "DISCUSSED" | "OBSERVED";
}

export interface IPutSkillVerificationStatus {
  readonly verified: boolean;
  readonly rating?: number;
}
