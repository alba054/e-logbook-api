export interface IPostCase {
  name: string;
  type: "OBTAINED" | "DISCUSSED" | "OBSERVED";
}

export interface IPutCaseVerificationStatus {
  readonly verified: boolean;
  readonly rating?: number;
}
