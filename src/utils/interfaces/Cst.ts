export interface IPostCST {
  supervisorId: string;
  startTime: number;
  endTime: number;
  topicId: number[];
  notes?: string;
}

export interface IPostCSTTopic {
  topicId: number[];
  notes?: string;
}

export interface IPutCstTopicVerificationStatus {
  readonly verified: boolean;
}

export interface IPutCST {
  supervisorId?: string;
  startTime?: number;
  endTime?: number;
  date?: string;
  notes?: string;
  topics?: {
    oldId: string;
    newId: number;
  }[]
}