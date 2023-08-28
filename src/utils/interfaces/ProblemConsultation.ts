export interface IPostProblemConsultation {
  readonly content: string;
}

export interface IPutProblemConsultation {
  readonly content: string;
}

export interface IPutProblemConsultationVerificationStatus {
  readonly verified: string;
  readonly rating?: number;
  readonly feedback?: string;
}
