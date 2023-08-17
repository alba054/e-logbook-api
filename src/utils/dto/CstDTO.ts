export interface ISubmittedCst {
  studentName: string;
  latest: Date | string;
  studentId: string;
}

export interface IStudentCst {
  studentName: string;
  studentId: string;
  csts: ICstDetail[];
}

export interface ICstDetail {
  createdAt: Date | string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  cstId: string;
  topic: ICstTopic[];
}

export interface ICstTopic {
  topicName: string[];
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  startTime?: number;
  endTime?: number;
  notes?: string;
  id: string;
}
