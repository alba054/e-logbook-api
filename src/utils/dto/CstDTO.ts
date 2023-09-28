export interface ISubmittedCst {
  studentName: string;
  latest: Date | string;
  studentId: string;
  unitName: string;
}

export interface IStudentCst {
  studentName: string;
  studentId: string;
  csts: ICstDetail[];
}



export interface ICstHistoryDetail {
  createdAt: Date | string;
  cstId: string;
  startTime?: number;
  endTime?: number;
  supervisorName?: string;
  supervisorId?: string;
  studentId?: string,
  studentName?: string,
  unitName?: string;
  topic: ICstTopic[];
}
export interface ICstDetail {
  startTime?: number;
  endTime?: number;
  createdAt: Date | string;
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  cstId: string;
  supervisorName?: string;
  supervisorId?: string;
  topic: ICstTopic[];
}

export interface ICstTopic {
  topicName: string[];
  verificationStatus: "INPROCESS" | "VERIFIED" | "UNVERIFIED";
  notes?: string;
  id: string;
}
