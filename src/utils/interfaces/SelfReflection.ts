export interface IPostSelfReflection {
  readonly content: string;
}

export interface IPutSelfReflectionVerificationStatus {
  readonly verified: boolean;
  readonly rating?: number;
}
