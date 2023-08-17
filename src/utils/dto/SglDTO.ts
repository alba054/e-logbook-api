export interface ISubmittedSgl {
  studentName: string;
  latest: Date | string;
  studentId: string;
}

export interface IStudentSgl {
  studentName: string;
  studentId: string;
  sgls: ISglDetail[];
}

export interface ISglDetail {
  createdAt: Date | string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  sglId: string;
  topic: ISglTopic[];
}

export interface ISglTopic {
  topicName: string[];
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  startTime?: number;
  endTime?: number;
  notes?: string;
  id: string;
}
