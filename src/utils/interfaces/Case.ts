export interface IPostCase {
  readonly type: "OBTAINED" | "DISCUSSED";
  readonly caseTypeId: number;
  readonly supervisorId: string;
}

export interface IPutCaseVerificationStatus {
  readonly verified: boolean;
  readonly rating?: number;
}

export interface IPutCasesVerificationStatus {
  readonly rating?: number;
}
