export interface IListScientificSessionDTO {
  id: string;
  studentName?: string;
  time?: string | Date;
  studentId?: string;
  attachment?: string;
  status: "VERIFIED" | "UNVERIFIED" | "INPROCESS";
}

export interface IScientificSessionDetail {
  studentName: string;
  supervisorName: string;
  role: string;
  topic: string;
  title: string;
  reference: string;
  rating: number;
  updatedAt: Date | string;
  attachment?: string;
  filename?: string;
}

export interface IStudentScientificSessions {
  verifiedCounts: number;
  unverifiedCounts: number;
  listScientificSessions: IListStudentScientificSessionDTO[];
}

interface IListStudentScientificSessionDTO {
  supervisorName: string;
  verificationStatus: "VERIFIED" | "INPROCESS" | "UNVERIFIED";
  scientificSessionId: string;
  updatedAt: string | Date | number;
}
