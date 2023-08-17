export interface IPostCST {
  supervisorId: string;
  startTime: number;
  endTime: number;
  topicId: number[];
  notes?: string;
}

export interface IPutCstTopicVerificationStatus {
  readonly verified: boolean;
}
