export interface IPostSGL {
  supervisorId: string;
  startTime: number;
  endTime: number;
  topicId: number[];
  notes?: string;
}

export interface IPutSglTopicVerificationStatus {
  readonly verified: boolean;
}
