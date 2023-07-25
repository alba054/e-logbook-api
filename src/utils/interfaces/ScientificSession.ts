export interface IPostScientificSessionPayload {
  readonly notes?: string;
  readonly attachment?: string;
  readonly supervisorId: string;
  readonly sessionType: string;
  readonly topic: string;
  readonly title: string;
  readonly reference: string;
  readonly role: string;
}

export interface IPutVerificationStatusScientificSession {
  readonly verified: boolean;
  readonly rating?: number;
}

export interface IPutFeedbackScientificSession {
  readonly feedback: string;
}
