export interface ISubmittedSgl {
  studentName: string;
  latest: Date | string;
  unitName?: string;
  studentId: string;
}

export interface IStudentSgl {
  studentName: string;
  studentId: string;
  unitName?: string;
  sgls: ISglDetail[];
}

export interface ISglDetail {
  createdAt: Date | string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  sglId: string;
  startTime?: number;
  endTime?: number;
  supervisorName?: string;
  supervisorId?: string;
  topic: ISglTopic[];
}

export interface ISglTopic {
  topicName: string[];
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";

  notes?: string;
  id: string;
}
