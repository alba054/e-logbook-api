export interface IPostSkill {
  readonly type: "OBSERVER" | "PERFORM";
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
