export interface IPostSGL {
  supervisorId: string;
  startTime: number;
  endTime: number;
  topicId: number[];
  notes?: string;
}

export interface IPostSGLTopic {
  topicId: number[];
  notes?: string;
}

export interface IPutSglTopicVerificationStatus {
  readonly verified: boolean;
}

export interface IPutSGLTopic {
  topicId: number;
}

export interface IPutSGL {
  supervisorId?: string;
  startTime?: number;
  endTime?: number;
  notes?: string;
}
